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
    inherit (inputs.nix-filter.lib) filter inDirectory matchExt;
  in rec {
    dream2nix.inputs.self = {
      source = filter {
        root = ./.;
        include = [
          (inDirectory "src")
          (inDirectory "public")
          (matchExt "js")
          (matchExt "json")
          (matchExt "ts")
          (matchExt "cjs")
          (matchExt "mjs")
        ];
      };

      projects.site = {
        name = "site";
        subsystem = "nodejs";
        translator = "package-lock";
      };

      packageOverrides.site = {
        buildSearchIndex = {
          # provide this project's cli package to enable postbuild script to work
          nativeBuildInputs = old: old ++ [self'.packages.cli];

          # duplicated by package.json's postbuild script
          # TODO: remove one or the other
          buildPhase = old: ''
            ${self'.packages.cli}/bin/cli search-index ./src/pages/posts > ./public/search-index.json

            ${old}
          '';
        };

        # Instead of packaging the library, only package the final build
        copySite = {
          installPhase = ''
            mkdir -p $out
            cp -r ./dist/* $out
          '';
        };
      };
    };
  };
}
