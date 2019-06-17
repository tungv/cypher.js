#include <napi.h>
#include <cypher-parser.h>
#include <stdio.h>
#include <iostream>
#include "ASTNode.hpp"

Napi::Object ParseQuery(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::Object obj = Napi::Object::New(env);

  // parsing
  auto query = info[0];
  auto str = query.ToString().Utf8Value().c_str();
  auto rootObj = Napi::Object::New(env);

  
  auto config = cypher_parser_new_config();
  cypher_parse_result_t *result = cypher_parse(str, NULL, config, CYPHER_PARSE_ONLY_STATEMENTS);

  if (result == NULL) {
    throw Napi::Error::New(env, "Cypher Parse Exception");    
  }

  auto nErrors = cypher_parse_result_nerrors(result);
  auto errors = Napi::Array::New(env, nErrors);

  for (unsigned int i = 0; i < nErrors; i++) {
    auto node = cypher_parse_result_get_error(result, i);
    if (!node)
      continue;

    auto error = Napi::Object::New(env);

    error.Set(Napi::String::New(env, "message"), Napi::String::New(env, cypher_parse_error_message(node)));
    error.Set(Napi::String::New(env, "context"), Napi::String::New(env, cypher_parse_error_context(node)));
    error.Set(Napi::String::New(env, "contextOffset"), Napi::Number::New(env, cypher_parse_error_context_offset(node)));


    auto position = cypher_parse_error_position(node);
    auto jsPosition = Napi::Object::New(env);
    jsPosition.Set(Napi::String::New(env, "line"), Napi::Number::New(env, position.line));
    jsPosition.Set(Napi::String::New(env, "column"), Napi::Number::New(env, position.column));
    jsPosition.Set(Napi::String::New(env, "offset"), Napi::Number::New(env, position.offset));

    error.Set(Napi::String::New(env, "posotion"), jsPosition);

    errors[i] = error; 
  }
  
  // constructing response
  obj.Set(Napi::String::New(env, "nnodes"), cypher_parse_result_nnodes(result));
  obj.Set(Napi::String::New(env, "eof"), cypher_parse_result_eof(result));
  obj.Set(Napi::String::New(env, "errors"), errors);

  // constructing root node walker
  auto root = cypher_parse_result_get_root(result, 0);
  ASTNode node(root, rootObj);

  // recursively walk from root
  node.Walk(env);

  // clean up
  cypher_parse_result_free(result);
  cypher_parser_config_free(config);

  obj.Set(Napi::String::New(env, "root"), rootObj);
  return obj;
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  return Napi::Function::New(env, ParseQuery, "parse");
}

NODE_API_MODULE(addon, Init)
