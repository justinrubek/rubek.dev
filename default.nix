{
  inputs,
  self,
  ...
} @ part-inputs: {
  imports = [];

  perSystem = {
    pkgs,
    lib,
    system,
    inputs',
    self',
    ...
  }: let
    fenix-channel = inputs'.fenix.packages.latest;
    fenix-toolchain = fenix-channel.withComponents [
      "rustc"
      "cargo"
      "clippy"
      "rust-analysis"
      "rust-src"
      "rustfmt"
      "llvm-tools-preview"
    ];

    craneLib = inputs.crane.lib.${system}.overrideToolchain fenix-toolchain;

    common-build-args = rec {
      src = inputs.nix-filter.lib {
        root = ./.;
        include = [
          "crates"
          "Cargo.toml"
          "Cargo.lock"
        ];
      };

      pname = "rust-crane";

      buildInputs = allBuildInputs [];
      nativeBuildInputs = allNativeBuildInputs [];
      LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath buildInputs;
    };
    deps-only = craneLib.buildDepsOnly ({} // common-build-args);

    clippy-check = craneLib.cargoClippy ({
        cargoArtifacts = deps-only;
        cargoClippyExtraArgs = "--all-features -- --deny warnings";
      }
      // common-build-args);

    rust-fmt-check = craneLib.cargoFmt ({
        inherit (common-build-args) src;
      }
      // common-build-args);

    tests-check = craneLib.cargoNextest ({
        cargoArtifacts = deps-only;
        partitions = 1;
        partitionType = "count";
      }
      // common-build-args);

    pre-commit-hooks = inputs.pre-commit-hooks.lib.${system}.run {
      inherit (common-build-args) src;
      hooks = {
        alejandra.enable = true;
      };
    };

    api-package = craneLib.buildPackage ({
        pname = "api";
        cargoArtifacts = deps-only;
        cargoExtraArgs = "--bin api";
      }
      // common-build-args);

    cli-package = craneLib.buildPackage ({
        pname = "cli";
        cargoArtifacts = deps-only;
        cargoExtraArgs = "--bin cli";
      }
      // common-build-args);

    devTools = [
      # rust tooling
      fenix-toolchain
      pkgs.bacon
      pkgs.rustfmt
      # javascript tooling
      pkgs.nodejs
      # version control
      pkgs.cocogitto
      inputs'.bomper.packages.cli
      # misc
      pkgs.skopeo

      # self'.packages.cli
    ];

    extraBuildInputs = [
      pkgs.pkg-config
    ];
    extraNativeBuildInputs = [
      pkgs.openssl
      pkgs.openssl.dev
    ];

    allBuildInputs = base: base ++ extraBuildInputs;
    allNativeBuildInputs = base: base ++ extraNativeBuildInputs;
  in rec {
    devShells.default = pkgs.mkShell rec {
      buildInputs = allBuildInputs [fenix-toolchain] ++ devTools;
      nativeBuildInputs = allNativeBuildInputs [];
      LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath buildInputs;
      inherit (self.checks.${system}.pre-commit-hooks) shellHook;
    };

    packages = {
      default = packages.api;
      api = api-package;
      cli = cli-package;
      server = pkgs.runCommand "bundled-server" {} ''
        mkdir -p $out

        mkdir -p $out/public
        cp -r ${self'.packages.site}/* $out/public

        mkdir -p $out/bin
        cp ${api-package}/bin/api $out/bin
      '';

      "server/script" = pkgs.writeShellScriptBin "start_server" ''
        ${api-package}/bin/api ${self'.packages.site}
      '';

      "server/image" = pkgs.dockerTools.buildImage {
        name = "rubek.dev";
        tag = self.rev or "dirty";
        created = "now";

        copyToRoot = pkgs.buildEnv {
          name = "image-root";
          paths = [
            self'.packages.server
          ];
          pathsToLink = ["/bin" "/public"];
        };

        config.Cmd = ["/bin/api" "/public"];
      };
    };

    apps = {
      api = {
        type = "app";
        program = "${self.packages.${system}.api}/bin/api";
      };
      cli = {
        type = "app";
        program = "${self.packages.${system}.cli}/bin/cli";
      };
      default = apps.api;
    };

    checks = {
      inherit pre-commit-hooks;
      clippy = clippy-check;
      tests = tests-check;
      rust-fmt = rust-fmt-check;
    };
  };
}
