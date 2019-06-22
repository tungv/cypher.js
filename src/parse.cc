#include <napi.h>
#include <cypher-parser.h>
#include <stdio.h>
#include <iostream>
#include "ASTNode.hpp"

using namespace std;
using namespace Napi;

cypher_parse_result_t *ParseLongQuery(string query)
{
  string temp_file_name = std::tmpnam(nullptr);
  auto file_name = temp_file_name.c_str();

  FILE *inputStream = fopen(file_name, "w");
  auto str = query.c_str();
  for (unsigned int i = 0; i < query.length(); ++i)
  {
    fputc(str[i], inputStream);
  }
  fclose(inputStream);

  inputStream = fopen(file_name, "r");

  auto config = cypher_parser_new_config();
  cypher_parse_result_t *result = cypher_fparse(inputStream, NULL, config, CYPHER_PARSE_ONLY_STATEMENTS);
  cypher_parser_config_free(config);
  remove(file_name);

  return result;
}

cypher_parse_result_t *ParseShortQuery(string query)
{
  auto config = cypher_parser_new_config();
  cypher_parse_result_t *result = cypher_parse(query.c_str(), NULL, config, CYPHER_PARSE_ONLY_STATEMENTS);
  cypher_parser_config_free(config);
  return result;
}

cypher_parse_result_t *Parse(string query)
{
  if (query.length() >= 1024)
  {
    return ParseLongQuery(query);
  }
  else
  {
    return ParseShortQuery(query);
  }
}

Object ParseQuery(const CallbackInfo &info)
{
  Env env = info.Env();
  Object obj = Object::New(env);

  // parsing
  string query = string(info[0].As<String>());
  cypher_parse_result_t *result = Parse(query);

  if (result == NULL)
  {
    throw Error::New(env, "Cypher Parse Exception");
  }

  auto nErrors = cypher_parse_result_nerrors(result);
  auto errors = Array::New(env, nErrors);

  for (unsigned int i = 0; i < nErrors; i++)
  {
    auto node = cypher_parse_result_get_error(result, i);
    if (!node)
      continue;

    auto error = Object::New(env);

    cerr << "error[" << i << "]: " << cypher_parse_error_message(node) << endl;

    error.Set(String::New(env, "message"), String::New(env, cypher_parse_error_message(node)));
    error.Set(String::New(env, "context"), String::New(env, cypher_parse_error_context(node)));
    error.Set(String::New(env, "contextOffset"), Number::New(env, cypher_parse_error_context_offset(node)));

    auto position = cypher_parse_error_position(node);
    auto jsPosition = Object::New(env);
    jsPosition.Set(String::New(env, "line"), Number::New(env, position.line));
    jsPosition.Set(String::New(env, "column"), Number::New(env, position.column));
    jsPosition.Set(String::New(env, "offset"), Number::New(env, position.offset));

    error.Set(String::New(env, "position"), jsPosition);

    errors[i] = error;
  }

  // constructing response
  obj.Set(String::New(env, "nnodes"), cypher_parse_result_nnodes(result));
  obj.Set(String::New(env, "eof"), cypher_parse_result_eof(result) == 1);
  obj.Set(String::New(env, "errors"), errors);

  // constructing root node walker
  auto root = cypher_parse_result_get_root(result, 0);
  if (root == NULL)
  {
    obj.Set(String::New(env, "root"), env.Null());
  }
  else
  {
    auto rootObj = Object::New(env);
    ASTNode node(root, rootObj);
    // recursively walk from root
    node.Walk(env);
    obj.Set(String::New(env, "root"), rootObj);
  }

  // clean up
  cypher_parse_result_free(result);

  return obj;
}

Object Init(Env env, Object exports)
{
  return Function::New(env, ParseQuery, "parse");
}

NODE_API_MODULE(addon, Init)
