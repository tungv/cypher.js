#include "ASTNode.hpp"
#include "napi.h"
#include <cypher-parser.h>
#include <stdio.h>
#include <iostream>

using namespace Napi;
using namespace std;

ASTNode::ASTNode(const cypher_astnode_t *node, Object parentJSObject)
{
  m_node = node;
  m_parent = parentJSObject;
}

void ASTNode::Walk(Env env)
{
  auto nodeType = cypher_astnode_type(m_node);
  if (nodeType == CYPHER_AST_STATEMENT)
    WalkStatement(env);
  else if (nodeType == CYPHER_AST_STATEMENT_OPTION)
    WalkStatementOption(env);
  else if (nodeType == CYPHER_AST_CYPHER_OPTION)
    WalkCypherOption(env);
  else if (nodeType == CYPHER_AST_CYPHER_OPTION_PARAM)
    WalkCypherOptionParam(env);
  else if (nodeType == CYPHER_AST_EXPLAIN_OPTION)
    WalkExplainOption(env);
  else if (nodeType == CYPHER_AST_PROFILE_OPTION)
    WalkProfileOption(env);

  /*******************CYPHER_AST_SCHEMA_COMMAND**********************/
  else if (nodeType == CYPHER_AST_CREATE_NODE_PROP_INDEX)
    WalkCreateNodePropIndex(env);
  else if (nodeType == CYPHER_AST_DROP_NODE_PROP_INDEX)
    WalkDropNodePropIndex(env);
  else if (nodeType == CYPHER_AST_CREATE_NODE_PROP_CONSTRAINT)
    WalkCreateNodePropConstraint(env);
  else if (nodeType == CYPHER_AST_DROP_NODE_PROP_CONSTRAINT)
    WalkDropNodePropConstraint(env);
  else if (nodeType == CYPHER_AST_CREATE_REL_PROP_CONSTRAINT)
    WalkCreateRelPropConstraint(env);
  else if (nodeType == CYPHER_AST_DROP_REL_PROP_CONSTRAINT)
    WalkDropRelPropConstraint(env);

  else if (nodeType == CYPHER_AST_QUERY)
    WalkQuery(env);

  /*******************CYPHER_AST_QUERY_OPTION**********************/
  else if (nodeType == CYPHER_AST_USING_PERIODIC_COMMIT)
    WalkUsingPeriodicCommit(env);

  /*******************CYPHER_AST_QUERY_CLAUSE**********************/
  else if (nodeType == CYPHER_AST_LOAD_CSV)
    WalkLoadCsv(env);
  else if (nodeType == CYPHER_AST_START)
    WalkStart(env);

  /********************CYPHER_AST_START_POINT**********************/
  else if (nodeType == CYPHER_AST_NODE_INDEX_LOOKUP)
    WalkNodeIndexLookup(env);
  else if (nodeType == CYPHER_AST_NODE_INDEX_QUERY)
    WalkNodeIndexQuery(env);
  else if (nodeType == CYPHER_AST_NODE_ID_LOOKUP)
    WalkNodeIdLookup(env);
  else if (nodeType == CYPHER_AST_ALL_NODES_SCAN)
    WalkAllNodesScan(env);
  else if (nodeType == CYPHER_AST_REL_INDEX_LOOKUP)
    WalkRelIndexLookup(env);
  else if (nodeType == CYPHER_AST_REL_INDEX_QUERY)
    WalkRelIndexQuery(env);
  else if (nodeType == CYPHER_AST_REL_ID_LOOKUP)
    WalkRelIdLookup(env);
  else if (nodeType == CYPHER_AST_ALL_RELS_SCAN)
    WalkAllRelsScan(env);

  else if (nodeType == CYPHER_AST_MATCH)
    WalkMatch(env);

  /********************CYPHER_AST_MATCH_HINT***********************/
  else if (nodeType == CYPHER_AST_USING_INDEX)
    WalkUsingIndex(env);
  else if (nodeType == CYPHER_AST_USING_JOIN)
    WalkUsingJoin(env);
  else if (nodeType == CYPHER_AST_USING_SCAN)
    WalkUsingScan(env);

  else if (nodeType == CYPHER_AST_MERGE)
    WalkMerge(env);

  /*******************CYPHER_AST_MERGE_ACTION**********************/
  else if (nodeType == CYPHER_AST_ON_MATCH)
    WalkOnMatch(env);
  else if (nodeType == CYPHER_AST_ON_CREATE)
    WalkOnCreate(env);

  else if (nodeType == CYPHER_AST_CREATE)
    WalkCreate(env);

  else if (nodeType == CYPHER_AST_SET)
    WalkSet(env);

  /*********************CYPHER_AST_SET_ITEM************************/
  else if (nodeType == CYPHER_AST_SET_PROPERTY)
    WalkSetProperty(env);
  else if (nodeType == CYPHER_AST_SET_ALL_PROPERTIES)
    WalkSetAllProperties(env);
  else if (nodeType == CYPHER_AST_MERGE_PROPERTIES)
    WalkMergeProperties(env);
  else if (nodeType == CYPHER_AST_SET_LABELS)
    WalkSetLabels(env);

  else if (nodeType == CYPHER_AST_DELETE)
    WalkDelete(env);

  else if (nodeType == CYPHER_AST_REMOVE)
    WalkRemove(env);

  /********************CYPHER_AST_REMOVE_ITEM**********************/
  else if (nodeType == CYPHER_AST_REMOVE_LABELS)
    WalkRemoveLabels(env);
  else if (nodeType == CYPHER_AST_REMOVE_PROPERTY)
    WalkRemoveProperty(env);

  else if (nodeType == CYPHER_AST_FOREACH)
    WalkForEach(env);
  else if (nodeType == CYPHER_AST_WITH)
    WalkWith(env);
  else if (nodeType == CYPHER_AST_UNWIND)
    WalkUnwind(env);
  else if (nodeType == CYPHER_AST_CALL)
    WalkCall(env);
  else if (nodeType == CYPHER_AST_RETURN)
    WalkReturn(env);
  else if (nodeType == CYPHER_AST_PROJECTION)
    WalkProjection(env);
  else if (nodeType == CYPHER_AST_ORDER_BY)
    WalkOrderBy(env);
  else if (nodeType == CYPHER_AST_SORT_ITEM)
    WalkSortItem(env);
  else if (nodeType == CYPHER_AST_UNION)
    WalkUnion(env);

  /*CYPHER_AST_EXPRESSION*/
  else if (nodeType == CYPHER_AST_UNARY_OPERATOR)
    WalkUnaryOperator(env);
  else if (nodeType == CYPHER_AST_BINARY_OPERATOR)
    WalkBinaryOperator(env);
  else if (nodeType == CYPHER_AST_COMPARISON)
    WalkComparison(env);
  else if (nodeType == CYPHER_AST_APPLY_OPERATOR)
    WalkApplyOperator(env);
  else if (nodeType == CYPHER_AST_APPLY_ALL_OPERATOR)
    WalkApplyAllOperator(env);
  else if (nodeType == CYPHER_AST_PROPERTY_OPERATOR)
    WalkPropertyOperator(env);
  else if (nodeType == CYPHER_AST_SUBSCRIPT_OPERATOR)
    WalkSubscriptOperator(env);
  else if (nodeType == CYPHER_AST_SLICE_OPERATOR)
    WalkSliceOperator(env);

  else if (nodeType == CYPHER_AST_MAP_PROJECTION)
    WalkMapProjection(env);

  /****************CYPHER_AST_MAP_PROJECTION_SELECTOR**************/
  else if (nodeType == CYPHER_AST_MAP_PROJECTION_LITERAL)
    WalkMapProjectionLiteral(env);
  else if (nodeType == CYPHER_AST_MAP_PROJECTION_PROPERTY)
    WalkMapProjectionProperty(env);
  else if (nodeType == CYPHER_AST_MAP_PROJECTION_IDENTIFIER)
    WalkMapProjectionIdentifier(env);
  else if (nodeType == CYPHER_AST_MAP_PROJECTION_ALL_PROPERTIES)
    WalkMapProjectionAllProperties(env);

  else if (nodeType == CYPHER_AST_LABELS_OPERATOR)
    WalkLabelsOperator(env);

  else if (nodeType == CYPHER_AST_LIST_COMPREHENSION)
    WalkListComprehension(env);
  else if (nodeType == CYPHER_AST_PATTERN_COMPREHENSION)
    WalkPatternComprehension(env);
  else if (nodeType == CYPHER_AST_CASE)
    WalkCase(env);
  else if (nodeType == CYPHER_AST_FILTER)
    WalkFilter(env);
  else if (nodeType == CYPHER_AST_EXTRACT)
    WalkExtract(env);
  else if (nodeType == CYPHER_AST_REDUCE)
    WalkReduce(env);
  else if (nodeType == CYPHER_AST_ALL)
    WalkAll(env);
  else if (nodeType == CYPHER_AST_ANY)
    WalkAny(env);
  else if (nodeType == CYPHER_AST_SINGLE)
    WalkSingle(env);
  else if (nodeType == CYPHER_AST_NONE)
    WalkNone(env);
  else if (nodeType == CYPHER_AST_COLLECTION)
    WalkCollection(env);
  else if (nodeType == CYPHER_AST_MAP)
    WalkMap(env);
  else if (nodeType == CYPHER_AST_IDENTIFIER)
    WalkIdentifier(env);
  else if (nodeType == CYPHER_AST_PARAMETER)
    WalkParameter(env);
  else if (nodeType == CYPHER_AST_STRING)
    WalkString(env);
  else if (nodeType == CYPHER_AST_INTEGER)
    WalkInteger(env);
  else if (nodeType == CYPHER_AST_FLOAT)
    WalkFloat(env);
  /*else if (nodeType == CYPHER_AST_BOOLEAN)
    WalkBoolean(env);*/
  else if (nodeType == CYPHER_AST_TRUE)
    WalkTrue(env);
  else if (nodeType == CYPHER_AST_FALSE)
    WalkFalse(env);
  else if (nodeType == CYPHER_AST_NULL)
    WalkNull(env);
  else if (nodeType == CYPHER_AST_LABEL)
    WalkLabel(env);
  else if (nodeType == CYPHER_AST_RELTYPE)
    WalkRelType(env);
  else if (nodeType == CYPHER_AST_PROP_NAME)
    WalkPropName(env);
  else if (nodeType == CYPHER_AST_FUNCTION_NAME)
    WalkFunctionName(env);
  else if (nodeType == CYPHER_AST_INDEX_NAME)
    WalkIndexName(env);
  else if (nodeType == CYPHER_AST_PROC_NAME)
    WalkProcName(env);
  else if (nodeType == CYPHER_AST_PATTERN)
    WalkPattern(env);
  else if (nodeType == CYPHER_AST_NAMED_PATH)
    WalkNamedPath(env);
  else if (nodeType == CYPHER_AST_SHORTEST_PATH)
    WalkShortestPath(env);
  else if (nodeType == CYPHER_AST_PATTERN_PATH)
    WalkPatternPath(env);
  else if (nodeType == CYPHER_AST_NODE_PATTERN)
    WalkNodePattern(env);
  else if (nodeType == CYPHER_AST_REL_PATTERN)
    WalkRelPattern(env);
  else if (nodeType == CYPHER_AST_RANGE)
    WalkRange(env);
  else if (nodeType == CYPHER_AST_COMMAND)
    WalkCommand(env);
  /*CYPHER_AST_COMMENT*/
  else if (nodeType == CYPHER_AST_LINE_COMMENT)
    WalkLineComment(env);
  else if (nodeType == CYPHER_AST_BLOCK_COMMENT)
    WalkBlockComment(env);
  else if (nodeType == CYPHER_AST_ERROR)
    WalkError(env);
  else
    std::cerr << "WARNING: No walker" << std::endl;
}

void ASTNode::AddMember(Env env, const char *key, const char *value)
{
  auto jsKey = String::New(env, key);
  auto jsValue = String::New(env, value);
  m_parent.Set(jsKey, jsValue);
}

void ASTNode::AddMember(Env env, const char *key, int value)
{
  auto jsKey = String::New(env, key);
  auto jsValue = Number::New(env, value);
  m_parent.Set(jsKey, jsValue);
}

void ASTNode::AddMember(Env env, const char *key, bool value)
{
  auto jsKey = String::New(env, key);
  auto jsValue = Boolean::New(env, value);
  m_parent.Set(jsKey, jsValue);
}

void ASTNode::AddMemberInt(Env env, const char *key, specific_node_getter getter)
{
  AddMemberInt(env, key, getter(m_node));
}

void ASTNode::AddMemberInt(Env env, const char *key, const cypher_astnode_t *intNode)
{
  if (!intNode)
  {
    AddMemberNull(env, key);
    return;
  }

  auto strVal = cypher_ast_integer_get_valuestr(intNode);
  if (!strVal)
  {
    AddMemberNull(env, key);
    return;
  }

  try
  {
    auto i = atoi(strVal);
    AddMember(env, key, i);
  }
  catch (const std::exception &e)
  {
    std::cerr << "std::stoi exception: " << e.what() << std::endl;
    AddMemberNull(env, key);
  }
}

void ASTNode::AddMemberFloat(Env env, const char *key, specific_node_getter getter)
{
  AddMemberFloat(env, key, getter(m_node));
}

void ASTNode::AddMemberFloat(Env env, const char *key, const cypher_astnode_t *floatNode)
{
  if (!floatNode)
  {
    AddMemberNull(env, key);
    return;
  }

  auto strVal = cypher_ast_float_get_valuestr(floatNode);
  if (!strVal)
  {
    AddMemberNull(env, key);
    return;
  }

  try
  {
    auto ld = strtod(strVal, NULL);
    auto jsKey = String::New(env, key);
    auto jsValue = Number::New(env, ld);

    m_parent.Set(jsKey, jsValue);
  }
  catch (const std::exception &e)
  {
    std::cerr << "std::stod exception: " << e.what() << std::endl;
    AddMemberNull(env, key);
  }
}

void ASTNode::AddMemberStr(Env env, const char *key, specific_node_getter getter)
{
  auto strNode = getter(m_node);
  if (!strNode)
  {
    AddMemberNull(env, key);
    return;
  }

  auto strVal = cypher_ast_string_get_value(strNode);
  if (!strVal)
  {
    AddMemberNull(env, key);
    return;
  }

  AddMember(env, key, strVal);
}

void ASTNode::AddMemberNull(Env env, const char *key)
{
  auto jsKey = String::New(env, key);
  m_parent.Set(jsKey, env.Null());
}

const char *ASTNode::ParseOp(const cypher_operator_t *op)
{
  if (op == CYPHER_OP_OR)
    return "or";
  else if (op == CYPHER_OP_XOR)
    return "xor";
  else if (op == CYPHER_OP_AND)
    return "and";
  else if (op == CYPHER_OP_NOT)
    return "not";
  else if (op == CYPHER_OP_EQUAL)
    return "equal";
  else if (op == CYPHER_OP_NEQUAL)
    return "not-equal";
  else if (op == CYPHER_OP_LT)
    return "less-than";
  else if (op == CYPHER_OP_GT)
    return "greater-than";
  else if (op == CYPHER_OP_LTE)
    return "less-than-equal";
  else if (op == CYPHER_OP_GTE)
    return "greater-than-equal";
  else if (op == CYPHER_OP_PLUS)
    return "plus";
  else if (op == CYPHER_OP_MINUS)
    return "minus";
  else if (op == CYPHER_OP_MULT)
    return "mult";
  else if (op == CYPHER_OP_DIV)
    return "div";
  else if (op == CYPHER_OP_MOD)
    return "mod";
  else if (op == CYPHER_OP_POW)
    return "pow";
  else if (op == CYPHER_OP_UNARY_PLUS)
    return "unary-plus";
  else if (op == CYPHER_OP_UNARY_MINUS)
    return "unary-minus";
  else if (op == CYPHER_OP_SUBSCRIPT)
    return "subscript";
  else if (op == CYPHER_OP_MAP_PROJECTION)
    return "map-projection";
  else if (op == CYPHER_OP_REGEX)
    return "regex";
  else if (op == CYPHER_OP_IN)
    return "in";
  else if (op == CYPHER_OP_STARTS_WITH)
    return "starts-with";
  else if (op == CYPHER_OP_ENDS_WITH)
    return "ends-with";
  else if (op == CYPHER_OP_CONTAINS)
    return "contains";
  else if (op == CYPHER_OP_IS_NULL)
    return "is-null";
  else if (op == CYPHER_OP_IS_NOT_NULL)
    return "is-not-null";
  else if (op == CYPHER_OP_PROPERTY)
    return "property";
  else if (op == CYPHER_OP_LABEL)
    return "label";
  else
  {
    std::cerr << "WARNING: Unknown operator" << std::endl;
    return NULL;
  }
}

void ASTNode::AddMemberOp(Env env, const char *key, operator_getter getter)
{
  AddMember(env, key, ParseOp(getter(m_node)));
}

void ASTNode::Node(Env env, const char *name, const cypher_astnode_t *node)
{
  if (!node)
  {
    return;
  }

  auto jsKey = String::New(env, name);
  const Object jsValue = Object::New(env);
  m_parent.Set(jsKey, jsValue);

  ASTNode astNode(node, jsValue);
  astNode.Walk(env);
}

void ASTNode::Node(Env env, const char *name, specific_node_getter getter)
{
  Node(env, name, getter(m_node));
}

void ASTNode::LoopNodes(Env env, const char *name, unsigned int counter, node_getter getter)
{
  auto nodes = Array::New(env);
  auto jsKey = String::New(env, name);

  m_parent.Set(jsKey, nodes);

  unsigned int arrayIndex = 0;

  for (unsigned int i = 0; i < counter; i++)
  {
    auto node = getter(m_node, i);
    if (!node)
      continue;

    auto obj = Object::New(env);
    ASTNode item(node, obj);
    item.Walk(env);

    nodes[arrayIndex] = obj;
    arrayIndex++;
  }
}

void ASTNode::LoopNodes(Env env, const char *name, node_counter counter, node_getter getter)
{
  LoopNodes(env, name, counter(m_node), getter);
}

void ASTNode::LoopOps(Env env, const char *name, node_counter counter, op_getter getter)
{
  auto nodes = Array::New(env);
  auto jsKey = String::New(env, name);

  for (unsigned int i = 0; i < counter(m_node); i++)
  {
    nodes[i] = ParseOp(getter(m_node, i));
  }

  m_parent.Set(jsKey, nodes);
}

void ASTNode::LoopKeyValuePairs(
    Env env,
    const char *name,
    const char *keyName,
    const char *valueName,
    node_counter counter,
    node_getter keyGetter,
    node_getter valueGetter)
{
  auto items = Array::New(env);
  unsigned int itemIndex = 0;
  for (unsigned int i = 0; i < counter(m_node); i++)
  {
    auto keyNode = keyGetter(m_node, i);
    if (!keyNode)
      continue;

    auto valueNode = valueGetter(m_node, i);
    if (!valueNode)
      continue;

    auto jsKey = Object::New(env);
    ASTNode keyAst(keyNode, jsKey);
    keyAst.Walk(env);

    auto jsValue = Object::New(env);
    ASTNode valueAst(valueNode, jsValue);
    valueAst.Walk(env);

    auto itemObj = Object::New(env);

    itemObj.Set(keyName, jsKey);
    itemObj.Set(valueName, jsValue);
    items[itemIndex] = itemObj;
    itemIndex++;
  }

  m_parent.Set(String::New(env, name), items);
}

// WALKERS
void ASTNode::WalkParameter(Env env)
{
  AddMember(env, "type", "parameter");
  AddMember(env, "name", cypher_ast_parameter_get_name(m_node));
}

void ASTNode::WalkMatch(Env env)
{
  AddMember(env, "type", "match");
  AddMember(env, "optional", (bool)cypher_ast_match_is_optional(m_node));
  Node(env, "pattern", cypher_ast_match_get_pattern);
  LoopNodes(env, "hints", cypher_ast_match_nhints, cypher_ast_match_get_hint);
  Node(env, "predicate", cypher_ast_match_get_predicate);
}

void ASTNode::WalkQuery(Env env)
{
  AddMember(env, "type", "query");
  LoopNodes(env, "clauses", cypher_ast_query_nclauses, cypher_ast_query_get_clause);
  LoopNodes(env, "options", cypher_ast_query_noptions, cypher_ast_query_get_option);
}

void ASTNode::WalkStatement(Env env)
{
  AddMember(env, "type", "statement");
  Node(env, "body", cypher_ast_statement_get_body);
  LoopNodes(env, "options", cypher_ast_statement_noptions, cypher_ast_statement_get_option);
}

void ASTNode::WalkStatementOption(Env env)
{
  AddMember(env, "type", "statement-option");
}

void ASTNode::WalkCypherOption(Env env)
{
  AddMember(env, "type", "cypher-option");
  AddMember(env, "version", cypher_ast_cypher_option_get_version(m_node));
  LoopNodes(env, "params", cypher_ast_cypher_option_nparams, cypher_ast_cypher_option_get_param);
}

void ASTNode::WalkCypherOptionParam(Env env)
{
  AddMember(env, "type", "cypher-option-param");
  Node(env, "name", cypher_ast_cypher_option_param_get_name);
  Node(env, "value", cypher_ast_cypher_option_param_get_value(m_node));
}

void ASTNode::WalkExplainOption(Env env)
{
  WalkStatementOption(env);
}

void ASTNode::WalkProfileOption(Env env)
{
  WalkStatementOption(env);
}

void ASTNode::WalkCreateNodePropIndex(Env env)
{
  AddMember(env, "type", "create-node-prop-index");
  Node(env, "label", cypher_ast_create_node_prop_index_get_label);
  Node(env, "propName", cypher_ast_create_node_prop_index_get_prop_name);
}

void ASTNode::WalkDropNodePropIndex(Env env)
{
  AddMember(env, "type", "drop-node-prop-index");
  Node(env, "label", cypher_ast_drop_node_prop_index_get_label);
  Node(env, "propName", cypher_ast_drop_node_prop_index_get_prop_name);
}

void ASTNode::WalkCreateNodePropConstraint(Env env)
{
  AddMember(env, "type", "create-node-prop-constraint");
  Node(env, "identifier", cypher_ast_create_node_prop_constraint_get_identifier);
  Node(env, "label", cypher_ast_create_node_prop_constraint_get_label);
  Node(env, "expression", cypher_ast_create_node_prop_constraint_get_expression);
  AddMember(env, "unique", (bool)cypher_ast_create_node_prop_constraint_is_unique(m_node));
}

void ASTNode::WalkDropNodePropConstraint(Env env)
{
  AddMember(env, "type", "drop-node-prop-constraint");
  Node(env, "identifier", cypher_ast_drop_node_prop_constraint_get_identifier);
  Node(env, "label", cypher_ast_drop_node_prop_constraint_get_label);
  Node(env, "expression", cypher_ast_drop_node_prop_constraint_get_expression);
  AddMember(env, "unique", (bool)cypher_ast_drop_node_prop_constraint_is_unique(m_node));
}

void ASTNode::WalkCreateRelPropConstraint(Env env)
{
  AddMember(env, "type", "create-rel-prop-constraint");
  Node(env, "identifier", cypher_ast_create_rel_prop_constraint_get_identifier);
  Node(env, "relType", cypher_ast_create_rel_prop_constraint_get_reltype);
  Node(env, "expression", cypher_ast_create_rel_prop_constraint_get_expression);
  AddMember(env, "unique", (bool)cypher_ast_create_rel_prop_constraint_is_unique(m_node));
}

void ASTNode::WalkDropRelPropConstraint(Env env)
{
  AddMember(env, "type", "drop-rel-prop-constraint");
  Node(env, "identifier", cypher_ast_drop_rel_prop_constraint_get_identifier);
  Node(env, "relType", cypher_ast_drop_rel_prop_constraint_get_reltype);
  Node(env, "expression", cypher_ast_drop_rel_prop_constraint_get_expression);
  AddMember(env, "unique", (bool)cypher_ast_drop_rel_prop_constraint_is_unique(m_node));
}

void ASTNode::WalkUsingPeriodicCommit(Env env)
{
  AddMember(env, "type", "using-periodic-commit");
  AddMemberInt(env, "limit", cypher_ast_using_periodic_commit_get_limit);
}

void ASTNode::WalkLoadCsv(Env env)
{
  AddMember(env, "type", "load-csv");
  AddMember(env, "withHeaders", (bool)cypher_ast_load_csv_has_with_headers(m_node));
  Node(env, "url", cypher_ast_load_csv_get_url);
  Node(env, "identifier", cypher_ast_load_csv_get_identifier);
  Node(env, "fieldTerminator", cypher_ast_load_csv_get_field_terminator);
}

void ASTNode::WalkStart(Env env)
{
  AddMember(env, "type", "start");
  LoopNodes(env, "points", cypher_ast_start_npoints, cypher_ast_start_get_point);
  Node(env, "predicate", cypher_ast_start_get_predicate);
}

void ASTNode::WalkNodeIndexLookup(Env env)
{
  AddMember(env, "type", "node-index-lookup");
  Node(env, "identifier", cypher_ast_node_index_lookup_get_identifier);
  Node(env, "indexName", cypher_ast_node_index_lookup_get_index_name);
  Node(env, "propName", cypher_ast_node_index_lookup_get_prop_name);
  Node(env, "lookup", cypher_ast_node_index_lookup_get_lookup);
}

void ASTNode::WalkNodeIndexQuery(Env env)
{
  AddMember(env, "type", "node-index-query");
  Node(env, "identifier", cypher_ast_node_index_query_get_identifier);
  Node(env, "indexName", cypher_ast_node_index_query_get_index_name);
  Node(env, "query", cypher_ast_node_index_query_get_query);
}

void ASTNode::WalkNodeIdLookup(Env env)
{
  AddMember(env, "type", "node-id-lookup");
  Node(env, "identifier", cypher_ast_node_id_lookup_get_identifier);
  LoopNodes(env, "ids", cypher_ast_node_id_lookup_nids, cypher_ast_node_id_lookup_get_id);
}

void ASTNode::WalkAllNodesScan(Env env)
{
  AddMember(env, "type", "all-nodes-scan");
  Node(env, "identifier", cypher_ast_all_nodes_scan_get_identifier);
}

void ASTNode::WalkRelIndexLookup(Env env)
{
  AddMember(env, "type", "rel-index-lookup");
  Node(env, "identifier", cypher_ast_rel_index_lookup_get_identifier);
  Node(env, "indexName", cypher_ast_rel_index_lookup_get_index_name);
  Node(env, "propName", cypher_ast_rel_index_lookup_get_prop_name);
  Node(env, "lookup", cypher_ast_rel_index_lookup_get_lookup);
}

void ASTNode::WalkRelIndexQuery(Env env)
{
  AddMember(env, "type", "rel-index-query");
  Node(env, "identifier", cypher_ast_rel_index_query_get_identifier);
  Node(env, "indexName", cypher_ast_rel_index_query_get_index_name);
  Node(env, "query", cypher_ast_rel_index_query_get_query);
}

void ASTNode::WalkRelIdLookup(Env env)
{
  AddMember(env, "type", "rel-id-lookup");
  Node(env, "identifier", cypher_ast_rel_id_lookup_get_identifier);
  LoopNodes(env, "ids", cypher_ast_rel_id_lookup_nids, cypher_ast_rel_id_lookup_get_id);
}

void ASTNode::WalkAllRelsScan(Env env)
{
  AddMember(env, "type", "all-rels-scan");
  Node(env, "identifier", cypher_ast_all_rels_scan_get_identifier);
}

void ASTNode::WalkUsingIndex(Env env)
{
  AddMember(env, "type", "using-index");
  Node(env, "identifier", cypher_ast_using_index_get_identifier);
  Node(env, "label", cypher_ast_using_index_get_label);
  Node(env, "propName", cypher_ast_using_index_get_prop_name);
}

void ASTNode::WalkUsingJoin(Env env)
{
  AddMember(env, "type", "using-join");
  LoopNodes(env, "identifiers", cypher_ast_using_join_nidentifiers, cypher_ast_using_join_get_identifier);
}

void ASTNode::WalkUsingScan(Env env)
{
  AddMember(env, "type", "using-scan");
  Node(env, "identifier", cypher_ast_using_scan_get_identifier);
  Node(env, "label", cypher_ast_using_scan_get_label);
}

void ASTNode::WalkMerge(Env env)
{
  AddMember(env, "type", "merge");
  Node(env, "path", cypher_ast_merge_get_pattern_path);
  LoopNodes(env, "actions", cypher_ast_merge_nactions, cypher_ast_merge_get_action);
}

void ASTNode::WalkOnMatch(Env env)
{
  AddMember(env, "type", "on-match");
  LoopNodes(env, "items", cypher_ast_on_match_nitems, cypher_ast_on_match_get_item);
}

void ASTNode::WalkOnCreate(Env env)
{
  AddMember(env, "type", "on-create");
  LoopNodes(env, "items", cypher_ast_on_create_nitems, cypher_ast_on_create_get_item);
}

void ASTNode::WalkCreate(Env env)
{
  AddMember(env, "type", "create");
  AddMember(env, "unique", (bool)cypher_ast_create_is_unique(m_node));
  Node(env, "pattern", cypher_ast_create_get_pattern);
}

void ASTNode::WalkSet(Env env)
{
  AddMember(env, "type", "set");
  LoopNodes(env, "items", cypher_ast_set_nitems, cypher_ast_set_get_item);
}

void ASTNode::WalkSetProperty(Env env)
{
  AddMember(env, "type", "set-property");
  Node(env, "property", cypher_ast_set_property_get_property);
  Node(env, "expression", cypher_ast_set_property_get_expression);
}

void ASTNode::WalkSetAllProperties(Env env)
{
  AddMember(env, "type", "set-all-properties");
  Node(env, "identifier", cypher_ast_set_all_properties_get_identifier);
  Node(env, "expression", cypher_ast_set_all_properties_get_expression);
}

void ASTNode::WalkMergeProperties(Env env)
{
  AddMember(env, "type", "merge-properties");
  Node(env, "identifier", cypher_ast_merge_properties_get_identifier);
  Node(env, "expression", cypher_ast_merge_properties_get_expression);
}

void ASTNode::WalkSetLabels(Env env)
{
  AddMember(env, "type", "set-labels");
  Node(env, "identifier", cypher_ast_set_labels_get_identifier);
  LoopNodes(env, "labels", cypher_ast_set_labels_nlabels, cypher_ast_set_labels_get_label);
}

void ASTNode::WalkDelete(Env env)
{
  AddMember(env, "type", "delete");
  AddMember(env, "detach", (bool)cypher_ast_delete_has_detach(m_node));
  LoopNodes(env, "expressions", cypher_ast_delete_nexpressions, cypher_ast_delete_get_expression);
}

void ASTNode::WalkRemove(Env env)
{
  AddMember(env, "type", "remove");
  LoopNodes(env, "items", cypher_ast_remove_nitems, cypher_ast_remove_get_item);
}

void ASTNode::WalkRemoveLabels(Env env)
{
  AddMember(env, "type", "remove-labels");
  Node(env, "identifier", cypher_ast_remove_labels_get_identifier);
  LoopNodes(env, "labels", cypher_ast_remove_labels_nlabels, cypher_ast_remove_labels_get_label);
}

void ASTNode::WalkRemoveProperty(Env env)
{
  AddMember(env, "type", "remove-property");
  Node(env, "property", cypher_ast_remove_property_get_property);
}

void ASTNode::WalkForEach(Env env)
{
  AddMember(env, "type", "for-each");
  Node(env, "identifier", cypher_ast_foreach_get_identifier);
  Node(env, "expression", cypher_ast_foreach_get_expression);
  LoopNodes(env, "clauses", cypher_ast_foreach_nclauses, cypher_ast_foreach_get_clause);
}

void ASTNode::WalkWith(Env env)
{
  AddMember(env, "type", "with");
  AddMember(env, "distinct", (bool)cypher_ast_with_is_distinct(m_node));
  AddMember(env, "includeExisting", (bool)cypher_ast_with_has_include_existing(m_node));
  LoopNodes(env, "projections", cypher_ast_with_nprojections, cypher_ast_with_get_projection);
  Node(env, "orderBy", cypher_ast_with_get_order_by);
  Node(env, "skip", cypher_ast_with_get_skip);
  Node(env, "limit", cypher_ast_with_get_limit);
  Node(env, "predicate", cypher_ast_with_get_predicate);
}

void ASTNode::WalkUnwind(Env env)
{
  AddMember(env, "type", "unwind");
  Node(env, "expression", cypher_ast_unwind_get_expression);
  Node(env, "alias", cypher_ast_unwind_get_alias);
}

void ASTNode::WalkCall(Env env)
{
  AddMember(env, "type", "call");
  Node(env, "procName", cypher_ast_call_get_proc_name);
  LoopNodes(env, "args", cypher_ast_call_narguments, cypher_ast_call_get_argument);
  LoopNodes(env, "projections", cypher_ast_call_nprojections, cypher_ast_call_get_projection);
}

void ASTNode::WalkReturn(Env env)
{
  AddMember(env, "type", "return");
  AddMember(env, "distinct", (bool)cypher_ast_return_is_distinct(m_node));
  AddMember(env, "includeExisting", (bool)cypher_ast_return_has_include_existing(m_node));
  LoopNodes(env, "projections", cypher_ast_return_nprojections, cypher_ast_return_get_projection);
  Node(env, "orderBy", cypher_ast_return_get_order_by);
  Node(env, "skip", cypher_ast_return_get_skip);
  Node(env, "limit", cypher_ast_return_get_limit);
}

void ASTNode::WalkProjection(Env env)
{
  AddMember(env, "type", "projection");
  Node(env, "expression", cypher_ast_projection_get_expression);
  Node(env, "alias", cypher_ast_projection_get_alias);
}

void ASTNode::WalkOrderBy(Env env)
{
  AddMember(env, "type", "order-by");
  LoopNodes(env, "items", cypher_ast_order_by_nitems, cypher_ast_order_by_get_item);
}

void ASTNode::WalkSortItem(Env env)
{
  AddMember(env, "type", "sort-item");
  Node(env, "expression", cypher_ast_sort_item_get_expression);
  AddMember(env, "ascending", (bool)cypher_ast_sort_item_is_ascending(m_node));
}

void ASTNode::WalkUnion(Env env)
{
  AddMember(env, "type", "union");
  AddMember(env, "all", (bool)cypher_ast_union_has_all(m_node));
}

void ASTNode::WalkUnaryOperator(Env env)
{
  AddMember(env, "type", "unary-operator");
  AddMemberOp(env, "op", cypher_ast_unary_operator_get_operator);
  Node(env, "arg", cypher_ast_unary_operator_get_argument);
}

void ASTNode::WalkBinaryOperator(Env env)
{
  AddMember(env, "type", "binary-operator");
  Node(env, "arg1", cypher_ast_binary_operator_get_argument1);
  Node(env, "arg2", cypher_ast_binary_operator_get_argument2);
  AddMemberOp(env, "op", cypher_ast_binary_operator_get_operator);
}

void ASTNode::WalkComparison(Env env)
{
  AddMember(env, "type", "comparison");
  AddMember(env, "length", (int)cypher_ast_comparison_get_length(m_node));
  LoopOps(env, "ops", cypher_ast_comparison_get_length, cypher_ast_comparison_get_operator);
  LoopNodes(env, "args", cypher_ast_comparison_get_length(m_node) + 1, cypher_ast_comparison_get_argument);
}

void ASTNode::WalkApplyOperator(Env env)
{
  AddMember(env, "type", "apply-operator");
  Node(env, "funcName", cypher_ast_apply_operator_get_func_name);
  AddMember(env, "distinct", (bool)cypher_ast_apply_operator_get_distinct(m_node));
  LoopNodes(env, "args", cypher_ast_apply_operator_narguments, cypher_ast_apply_operator_get_argument);
}

void ASTNode::WalkApplyAllOperator(Env env)
{
  AddMember(env, "type", "apply-all-operator");
  Node(env, "funcName", cypher_ast_apply_all_operator_get_func_name);
  AddMember(env, "distinct", (bool)cypher_ast_apply_all_operator_get_distinct(m_node));
}

void ASTNode::WalkPropertyOperator(Env env)
{
  AddMember(env, "type", "property-operator");
  Node(env, "expression", cypher_ast_property_operator_get_expression);
  Node(env, "propName", cypher_ast_property_operator_get_prop_name);
}

void ASTNode::WalkSubscriptOperator(Env env)
{
  AddMember(env, "type", "subscript-operator");
  Node(env, "expression", cypher_ast_subscript_operator_get_expression);
  Node(env, "subscript", cypher_ast_subscript_operator_get_subscript);
}

void ASTNode::WalkSliceOperator(Env env)
{
  AddMember(env, "type", "slice-operator");
  Node(env, "expression", cypher_ast_slice_operator_get_expression);
  Node(env, "start", cypher_ast_slice_operator_get_start);
  Node(env, "end", cypher_ast_slice_operator_get_end);
}

void ASTNode::WalkMapProjection(Env env)
{
  AddMember(env, "type", "map-projection");
  Node(env, "expression", cypher_ast_map_projection_get_expression);
  LoopNodes(env, "selectors", cypher_ast_map_projection_nselectors, cypher_ast_map_projection_get_selector);
}

void ASTNode::WalkMapProjectionLiteral(Env env)
{
  AddMember(env, "type", "map-projection-literal");
  Node(env, "propName", cypher_ast_map_projection_literal_get_prop_name);
  Node(env, "expression", cypher_ast_map_projection_literal_get_expression);
}

void ASTNode::WalkMapProjectionProperty(Env env)
{
  AddMember(env, "type", "map-projection-property");
  Node(env, "propName", cypher_ast_map_projection_property_get_prop_name);
}

void ASTNode::WalkMapProjectionIdentifier(Env env)
{
  AddMember(env, "type", "map-projection-identifier");
  Node(env, "identifier", cypher_ast_map_projection_identifier_get_identifier);
}

void ASTNode::WalkMapProjectionAllProperties(Env env)
{
  AddMember(env, "type", "map-projection-all-properties");
}

void ASTNode::WalkLabelsOperator(Env env)
{
  AddMember(env, "type", "labels-operator");
  Node(env, "expression", cypher_ast_labels_operator_get_expression);
  LoopNodes(env, "labels", cypher_ast_labels_operator_nlabels, cypher_ast_labels_operator_get_label);
}

void ASTNode::WalkListComprehension(Env env)
{
  AddMember(env, "type", "list-comprehension");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
  Node(env, "eval", cypher_ast_list_comprehension_get_eval);
}

void ASTNode::WalkPatternComprehension(Env env)
{
  AddMember(env, "type", "pattern-comprehension");
  Node(env, "identifier", cypher_ast_pattern_comprehension_get_identifier);
  Node(env, "pattern", cypher_ast_pattern_comprehension_get_pattern);
  Node(env, "predicate", cypher_ast_pattern_comprehension_get_predicate);
  Node(env, "eval", cypher_ast_pattern_comprehension_get_eval);
}

void ASTNode::WalkCase(Env env)
{
  AddMember(env, "type", "case");
  Node(env, "expression", cypher_ast_case_get_expression);
  LoopKeyValuePairs(env, "alternatives", "predicate", "value", cypher_ast_case_nalternatives,
                    cypher_ast_case_get_predicate, cypher_ast_case_get_value);
  Node(env, "default", cypher_ast_case_get_default);
}

void ASTNode::WalkFilter(Env env)
{
  AddMember(env, "type", "filter");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
}

void ASTNode::WalkExtract(Env env)
{
  AddMember(env, "type", "extract");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "eval", cypher_ast_pattern_comprehension_get_eval);
}

void ASTNode::WalkReduce(Env env)
{
  AddMember(env, "type", "reduce");
  Node(env, "accumulator", cypher_ast_reduce_get_accumulator);
  Node(env, "init", cypher_ast_reduce_get_init);
  Node(env, "identifier", cypher_ast_reduce_get_identifier);
  Node(env, "expression", cypher_ast_reduce_get_expression);
  Node(env, "eval", cypher_ast_reduce_get_eval);
}

void ASTNode::WalkAll(Env env)
{
  AddMember(env, "type", "all");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
}

void ASTNode::WalkAny(Env env)
{
  AddMember(env, "type", "any");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
}

void ASTNode::WalkSingle(Env env)
{
  AddMember(env, "type", "single");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
}

void ASTNode::WalkNone(Env env)
{
  AddMember(env, "type", "none");
  Node(env, "identifier", cypher_ast_list_comprehension_get_identifier);
  Node(env, "expression", cypher_ast_list_comprehension_get_expression);
  Node(env, "predicate", cypher_ast_list_comprehension_get_predicate);
}

void ASTNode::WalkCollection(Env env)
{
  AddMember(env, "type", "collection");
  LoopNodes(env, "elements", cypher_ast_collection_length, cypher_ast_collection_get);
}

void ASTNode::WalkMap(Env env)
{
  AddMember(env, "type", "map");

  auto entries = Object::New(env);
  m_parent.Set(String::New(env, "entries"), entries);

  for (unsigned int i = 0; i < cypher_ast_map_nentries(m_node); i++)
  {
    auto key = cypher_ast_map_get_key(m_node, i);
    auto value = cypher_ast_map_get_value(m_node, i);

    if (!key)
      continue;

    auto name = cypher_ast_prop_name_get_value(key);
    auto jsKey = String::New(env, name);
    auto jsValue = Object::New(env);

    entries.Set(jsKey, jsValue);

    ASTNode node(value, jsValue);
    node.Walk(env);
  }
}

void ASTNode::WalkIdentifier(Env env)
{
  AddMember(env, "type", "identifier");
  AddMember(env, "name", cypher_ast_identifier_get_name(m_node));
}

void ASTNode::WalkString(Env env)
{
  AddMember(env, "type", "string");
  AddMember(env, "value", cypher_ast_string_get_value(m_node));
}

void ASTNode::WalkInteger(Env env)
{
  AddMember(env, "type", "integer");
  AddMemberInt(env, "value", m_node);
}

void ASTNode::WalkFloat(Env env)
{
  AddMember(env, "type", "float");
  AddMemberFloat(env, "value", m_node);
}

void ASTNode::WalkTrue(Env env)
{
  AddMember(env, "type", "true");
}

void ASTNode::WalkFalse(Env env)
{
  AddMember(env, "type", "false");
}

void ASTNode::WalkNull(Env env)
{
  AddMember(env, "type", "null");
}

void ASTNode::WalkLabel(Env env)
{
  AddMember(env, "type", "label");
  AddMember(env, "name", cypher_ast_label_get_name(m_node));
}

void ASTNode::WalkRelType(Env env)
{
  AddMember(env, "type", "reltype");
  AddMember(env, "name", cypher_ast_reltype_get_name(m_node));
}

void ASTNode::WalkPropName(Env env)
{
  AddMember(env, "type", "prop-name");
  AddMember(env, "value", cypher_ast_prop_name_get_value(m_node));
}

void ASTNode::WalkFunctionName(Env env)
{
  AddMember(env, "type", "function-name");
  AddMember(env, "value", cypher_ast_function_name_get_value(m_node));
}

void ASTNode::WalkIndexName(Env env)
{
  AddMember(env, "type", "index-name");
  AddMember(env, "value", cypher_ast_index_name_get_value(m_node));
}

void ASTNode::WalkProcName(Env env)
{
  AddMember(env, "type", "proc-name");
  AddMember(env, "value", cypher_ast_proc_name_get_value(m_node));
}

void ASTNode::WalkPattern(Env env)
{
  AddMember(env, "type", "pattern");
  LoopNodes(env, "paths", cypher_ast_pattern_npaths, cypher_ast_pattern_get_path);
}

void ASTNode::WalkNamedPath(Env env)
{
  AddMember(env, "type", "named-path");
  Node(env, "identifier", cypher_ast_named_path_get_identifier);
  Node(env, "path", cypher_ast_named_path_get_path);
  LoopNodes(env, "elements", cypher_ast_pattern_path_nelements, cypher_ast_pattern_path_get_element);
}

void ASTNode::WalkShortestPath(Env env)
{
  AddMember(env, "type", "shortest-path");
  AddMember(env, "single", (bool)cypher_ast_shortest_path_is_single(m_node));
  Node(env, "path", cypher_ast_shortest_path_get_path);
  LoopNodes(env, "elements", cypher_ast_pattern_path_nelements, cypher_ast_pattern_path_get_element);
}

void ASTNode::WalkPatternPath(Env env)
{
  AddMember(env, "type", "pattern-path");
  LoopNodes(env, "elements", cypher_ast_pattern_path_nelements, cypher_ast_pattern_path_get_element);
}

void ASTNode::WalkNodePattern(Env env)
{
  AddMember(env, "type", "node-pattern");
  Node(env, "identifier", cypher_ast_node_pattern_get_identifier);
  LoopNodes(env, "labels", cypher_ast_node_pattern_nlabels, cypher_ast_node_pattern_get_label);
  Node(env, "properties", cypher_ast_node_pattern_get_properties);
}

void ASTNode::WalkRelPattern(Env env)
{
  AddMember(env, "type", "rel-pattern");
  AddMember(env, "direction", cypher_ast_rel_pattern_get_direction(m_node));
  Node(env, "identifier", cypher_ast_rel_pattern_get_identifier);
  LoopNodes(env, "reltypes", cypher_ast_rel_pattern_nreltypes, cypher_ast_rel_pattern_get_reltype);
  Node(env, "properties", cypher_ast_rel_pattern_get_properties);
  Node(env, "varLength", cypher_ast_rel_pattern_get_varlength);
}

void ASTNode::WalkRange(Env env)
{
  AddMember(env, "type", "range");
  AddMemberInt(env, "start", cypher_ast_range_get_start);
  AddMemberInt(env, "end", cypher_ast_range_get_end);
}

void ASTNode::WalkCommand(Env env)
{
  AddMember(env, "type", "command");
  AddMember(env, "name", cypher_ast_command_get_name(m_node));
  LoopNodes(env, "args", cypher_ast_command_narguments, cypher_ast_command_get_argument);
}

void ASTNode::WalkLineComment(Env env)
{
  AddMember(env, "type", "line-comment");
  AddMember(env, "value", cypher_ast_line_comment_get_value(m_node));
}

void ASTNode::WalkBlockComment(Env env)
{
  AddMember(env, "type", "block-comment");
  AddMember(env, "value", cypher_ast_block_comment_get_value(m_node));
}

void ASTNode::WalkError(Env env)
{
  AddMember(env, "type", "error");
  AddMember(env, "value", cypher_ast_error_get_value(m_node));
}