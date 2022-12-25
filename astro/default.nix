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
          (matchExt "cjs")
          (matchExt "mjs")
          ./package.json
          ./package-lock.json
        ];
      };

      projects.site = {
        name = "site";
        subsystem = "nodejs";
        translator = "package-lock";
      };

      # Instead of packaging the library, only package the final build
      packageOverrides.site.copySite = {
        installPhase = ''
          mkdir -p $out
          cp -r ./dist/* $out
        '';
      };
    };
  };
}
