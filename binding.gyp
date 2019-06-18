{
  "targets": [
    {
      "target_name": "native-cypher",
      "sources": [
        "src/parse.cc",
        "src/ASTNode.hpp",
        "src/ASTNode.cc"
      ],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "/usr/local/include"
      ],
      "libraries": [
        "/usr/local/lib/libcypher-parser.a", "-L/usr/lib"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.7"
      },
      "msvs_settings": {
        "VCCLCompilerTool": { "ExceptionHandling": 1 }
      }
    }
  ]
}
