# Local packaging patch

Source: `amazon-ivs-react-native-player@1.6.1` from the npm registry.

The upstream npm package includes repository-only lifecycle scripts and development metadata. A clean consumer install fails while trying to run `husky`, and a local file dependency otherwise installs the library's entire E2E toolchain. Mingle removes scripts and repository-only development metadata, while leaving runtime metadata, native source, published `lib` output, and codegen configuration unchanged.

The original Apache-2.0 license is preserved in `LICENSE`.
