#include <napi.h>
#include <cypher-parser.h>
#include <stdio.h>
#include <iostream>
#include "ASTNode.hpp"

using namespace std;
using namespace Napi;

Object ParseQuery(const CallbackInfo &info)
{
  Env env = info.Env();
  Object obj = Object::New(env);

  // parsing
  auto query = string(info[0].As<String>());

  cout << query << endl;

  auto str = query.c_str();

  auto rootObj = Object::New(env);

  
  auto config = cypher_parser_new_config();
  cypher_parse_result_t *result = cypher_parse(str, NULL, config, CYPHER_PARSE_ONLY_STATEMENTS);

  if (result == NULL) {
    throw Error::New(env, "Cypher Parse Exception");    
  }

  auto nErrors = cypher_parse_result_nerrors(result);
  auto errors = Array::New(env, nErrors);

  for (unsigned int i = 0; i < nErrors; i++) {
    auto node = cypher_parse_result_get_error(result, i);
    if (!node)
      continue;

    auto error = Object::New(env);

    error.Set(String::New(env, "message"), String::New(env, cypher_parse_error_message(node)));
    error.Set(String::New(env, "context"), String::New(env, cypher_parse_error_context(node)));
    error.Set(String::New(env, "contextOffset"), Number::New(env, cypher_parse_error_context_offset(node)));


    auto position = cypher_parse_error_position(node);
    auto jsPosition = Object::New(env);
    jsPosition.Set(String::New(env, "line"), Number::New(env, position.line));
    jsPosition.Set(String::New(env, "column"), Number::New(env, position.column));
    jsPosition.Set(String::New(env, "offset"), Number::New(env, position.offset));

    error.Set(String::New(env, "posotion"), jsPosition);

    errors[i] = error; 
  }
  
  // constructing response
  obj.Set(String::New(env, "nnodes"), cypher_parse_result_nnodes(result));
  obj.Set(String::New(env, "eof"), cypher_parse_result_eof(result));
  obj.Set(String::New(env, "errors"), errors);

  // constructing root node walker
  auto root = cypher_parse_result_get_root(result, 0);
  ASTNode node(root, rootObj);

  // recursively walk from root
  node.Walk(env);

  // clean up
  cypher_parse_result_free(result);
  cypher_parser_config_free(config);

  obj.Set(String::New(env, "root"), rootObj);
  return obj;
}

Object Init(Env env, Object exports)
{
  return Function::New(env, ParseQuery, "parse");
}

NODE_API_MODULE(addon, Init)
