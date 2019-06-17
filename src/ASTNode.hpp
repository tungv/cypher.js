#ifndef __AST_NODE_HPP__
#define __AST_NODE_HPP__

#include "napi.h"
#include <cypher-parser.h>
#include <stdio.h>
#include <iostream>

class ASTNode
{
public:
  ASTNode(const cypher_astnode_t *n, Napi::Object parentJSObject);

  void Walk(const Napi::Env env);

private:
  Napi::Object m_parent;
  Napi::Object m_jsObj;
  const cypher_astnode_t* m_node;

  typedef unsigned int (*node_counter)(const cypher_astnode_t *);
  typedef const cypher_astnode_t *(*node_getter)(const cypher_astnode_t *, unsigned int);
  typedef const cypher_astnode_t *(*specific_node_getter)(const cypher_astnode_t *);
  typedef const cypher_operator_t *(*operator_getter)(const cypher_astnode_t *);
  typedef const cypher_operator_t *(*op_getter)(const cypher_astnode_t *, unsigned int);

  void AddMember(Napi::Env env, const char *key, const char *value);
  void AddMember(Napi::Env env, const char *key, int value);
  void AddMember(Napi::Env env, const char *key, bool value);

  void AddMemberInt(Napi::Env env, const char *key, specific_node_getter getter);
  void AddMemberInt(Napi::Env env, const char *key, const cypher_astnode_t *intNode);
  void AddMemberFloat(Napi::Env env, const char *key, specific_node_getter getter);
  void AddMemberFloat(Napi::Env env, const char *key, const cypher_astnode_t *floatNode);
  void AddMemberStr(Napi::Env env, const char *key, specific_node_getter getter);
  void AddMemberNull(Napi::Env env, const char *key);
  void AddMemberOp(Napi::Env env, const char *key, operator_getter getter);

  void Node(Napi::Env env, const char *name, const cypher_astnode_t *node);
  void Node(Napi::Env env, const char *name, specific_node_getter getter);

  void LoopNodes(Napi::Env env, const char *name, node_counter counter, node_getter getter);
  void LoopNodes(Napi::Env env, const char *name, unsigned int counter, node_getter getter);
  void LoopOps(Napi::Env env, const char *name, node_counter counter, op_getter getter);
  void LoopKeyValuePairs(
    Napi::Env env,
    const char *name,
    const char *keyName,
    const char *valueName,
    node_counter counter,
    node_getter keyGetter,
    node_getter valueGetter
  );

  const char *ParseOp(const cypher_operator_t *op);

  void WalkQuery(Napi::Env env);
  void WalkStatement(Napi::Env env);
  void WalkStatementOption(Napi::Env env);
  void WalkCypherOption(Napi::Env env);
  void WalkCypherOptionParam(Napi::Env env);
  void WalkExplainOption(Napi::Env env);
  void WalkProfileOption(Napi::Env env);
  void WalkCreateNodePropIndex(Napi::Env env);
  void WalkDropNodePropIndex(Napi::Env env);
  void WalkCreateNodePropConstraint(Napi::Env env);
  void WalkDropNodePropConstraint(Napi::Env env);
  void WalkCreateRelPropConstraint(Napi::Env env);
  void WalkDropRelPropConstraint(Napi::Env env);
  void WalkUsingPeriodicCommit(Napi::Env env);
  void WalkLoadCsv(Napi::Env env);
  void WalkStart(Napi::Env env);
  void WalkNodeIndexLookup(Napi::Env env);
  void WalkNodeIndexQuery(Napi::Env env);
  void WalkNodeIdLookup(Napi::Env env);
  void WalkAllNodesScan(Napi::Env env);
  void WalkRelIndexLookup(Napi::Env env);
  void WalkRelIndexQuery(Napi::Env env);
  void WalkRelIdLookup(Napi::Env env);
  void WalkAllRelsScan(Napi::Env env);
  void WalkMatch(Napi::Env env);
  void WalkUsingIndex(Napi::Env env);
  void WalkUsingJoin(Napi::Env env);
  void WalkUsingScan(Napi::Env env);
  void WalkMerge(Napi::Env env);
  void WalkOnMatch(Napi::Env env);
  void WalkOnCreate(Napi::Env env);
  void WalkCreate(Napi::Env env);
  void WalkSet(Napi::Env env);
  void WalkSetProperty(Napi::Env env);
  void WalkSetAllProperties(Napi::Env env);
  void WalkMergeProperties(Napi::Env env);
  void WalkSetLabels(Napi::Env env);
  void WalkDelete(Napi::Env env);
  void WalkRemove(Napi::Env env);
  void WalkRemoveLabels(Napi::Env env);
  void WalkRemoveProperty(Napi::Env env);
  void WalkForEach(Napi::Env env);
  void WalkWith(Napi::Env env);
  void WalkUnwind(Napi::Env env);
  void WalkCall(Napi::Env env);
  void WalkReturn(Napi::Env env);
  void WalkProjection(Napi::Env env);
  void WalkOrderBy(Napi::Env env);
  void WalkSortItem(Napi::Env env);
  void WalkUnion(Napi::Env env);
  void WalkUnaryOperator(Napi::Env env);
  void WalkBinaryOperator(Napi::Env env);
  void WalkComparison(Napi::Env env);
  void WalkApplyOperator(Napi::Env env);
  void WalkApplyAllOperator(Napi::Env env);
  void WalkPropertyOperator(Napi::Env env);
  void WalkSubscriptOperator(Napi::Env env);
  void WalkSliceOperator(Napi::Env env);
  void WalkMapProjection(Napi::Env env);
  void WalkMapProjectionLiteral(Napi::Env env);
  void WalkMapProjectionProperty(Napi::Env env);
  void WalkMapProjectionIdentifier(Napi::Env env);
  void WalkMapProjectionAllProperties(Napi::Env env);
  void WalkLabelsOperator(Napi::Env env);
  void WalkListComprehension(Napi::Env env);
  void WalkPatternComprehension(Napi::Env env);
  void WalkCase(Napi::Env env);
  void WalkFilter(Napi::Env env);
  void WalkExtract(Napi::Env env);
  void WalkReduce(Napi::Env env);
  void WalkAll(Napi::Env env);
  void WalkAny(Napi::Env env);
  void WalkSingle(Napi::Env env);
  void WalkNone(Napi::Env env);
  void WalkCollection(Napi::Env env);
  void WalkMap(Napi::Env env);
  void WalkIdentifier(Napi::Env env);
  void WalkParameter(Napi::Env env);
  void WalkString(Napi::Env env);
  void WalkInteger(Napi::Env env);
  void WalkFloat(Napi::Env env);
  void WalkTrue(Napi::Env env);
  void WalkFalse(Napi::Env env);
  void WalkNull(Napi::Env env);
  void WalkLabel(Napi::Env env);
  void WalkRelType(Napi::Env env);
  void WalkPropName(Napi::Env env);
  void WalkFunctionName(Napi::Env env);
  void WalkIndexName(Napi::Env env);
  void WalkProcName(Napi::Env env);
  void WalkPattern(Napi::Env env);
  void WalkNamedPath(Napi::Env env);
  void WalkShortestPath(Napi::Env env);
  void WalkPatternPath(Napi::Env env);
  void WalkNodePattern(Napi::Env env);
  void WalkRelPattern(Napi::Env env);
  void WalkRange(Napi::Env env);
  void WalkCommand(Napi::Env env);
  void WalkLineComment(Napi::Env env);
  void WalkBlockComment(Napi::Env env);
  void WalkError(Napi::Env env);
};

#endif //__AST_NODE_HPP__