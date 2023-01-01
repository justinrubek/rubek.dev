use clap::Parser;
use gray_matter::{Matter, engine::YAML};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(clap::Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[clap(subcommand)]
    action: Action,
}

#[derive(clap::Subcommand, Debug)]
enum Action {
    /// Output JSON to use as an index for searching the site
    SearchIndex { 
        /// The directory to search for markdown files
        path: String 
    },
}

#[derive(Serialize, Deserialize, Debug)]
struct MatterData {
    title: String,
    description: String,
    tags: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct IndexEntry {
    slug: String,
    category: String,
    title: String,
    description: String,
    tags: Vec<String>,
    body: String,
}

fn main() {
    let args = Args::parse();

    match args.action {
        Action::SearchIndex { path } => generate_search_index(path),
    }
}

fn generate_search_index(path: String) {
    let index_values = glob::glob(&format!("{path}/**/*.md*"))
        .expect("failed to read glob")
        .map(|entry| {
            let entry = entry.expect("failed to read entry");

            let file = std::fs::read_to_string(&entry).expect("failed to read file");
            let slug = entry.file_name().expect("failed to get file name").to_str().expect("failed to convert file name to string").to_string();

            let matter = Matter::<YAML>::new();
            let matter_data = matter.parse_with_struct::<MatterData>(&file).expect("failed to parse matter data");
            (matter_data, slug)
        })
        .map(|(matter_data, slug)| {
            IndexEntry {
                slug,
                category: String::from("posts"),
                title: matter_data.data.title,
                description: matter_data.data.description,
                tags: matter_data.data.tags,
                body: matter_data.content,
            }
        })
        .collect::<Vec<_>>();

    println!("{}", json!(index_values));
}
