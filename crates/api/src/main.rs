use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, get_service, post},
    Router,
};
use caldav_utils::{
    availability::get_availability,
    caldav::client::{DavClient, DavCredentials},
};
use scheduling_api::{get_calendars, get_now, request_availability, state::CaldavAvailability};
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    // Use the first arg as the directory to serve files from
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".to_string());

    // Get the port to listen on from the environment, default 8000
    let port = std::env::var("PORT")
        .ok()
        .and_then(|it| it.parse().ok())
        .unwrap_or(8000);

    let username = std::env::var("CALDAV_USERNAME").expect("CALDAV_USERNAME not set");
    let password = std::env::var("CALDAV_PASSWORD").expect("CALDAV_PASSWORD not set");
    let credentials = DavCredentials::new(username.to_string(), password.to_string());

    let url = std::env::var("CALDAV_URL").expect("CALDAV_URL not set");

    let dav_client = DavClient::new(url.to_string(), credentials);

    let availability_calendar =
        std::env::var("AVAILABLE_CALENDAR").expect("AVAILABLE_CALENDAR not set");
    let booked_calendar = std::env::var("BOOKED_CALENDAR").expect("BOOKED_CALENDAR not set");

    let caldav_state = CaldavAvailability::new(
        availability_calendar.to_string(),
        booked_calendar.to_string(),
        dav_client,
    );

    scheduler_api(caldav_state, dir).await.unwrap();
}

async fn scheduler_api(caldav_state: CaldavAvailability, dir: String) -> Result<(), Box<dyn std::error::Error>> {
    let port = std::env::var("PORT")
        .ok()
        .and_then(|it| it.parse().ok())
        .unwrap_or(8000);

    let serve_dir = get_service(ServeDir::new(dir)).handle_error(handle_error);
    let app = Router::new()
        .route("/now", get(get_now))
        // POST since JS doesn't support body in GET
        .route("/availability", post(request_availability))
        .route("/health", get(health))
        .with_state(caldav_state)
        .fallback_service(serve_dir);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Listening on {addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}


async fn health() -> &'static str {
    "OK"
}

async fn handle_error(_err: std::io::Error) -> impl IntoResponse {
    (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error")
}
