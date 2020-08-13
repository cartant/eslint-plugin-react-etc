/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-react-etc
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import {
  findParent,
  isArrayExpression,
  isArrayPattern,
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
} from "eslint-etc";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description: "Forbids useEffect when useMemo should suffice.",
      recommended: false,
    },
    fixable: null,
    messages: {
      forbidden: "useEffect is forbidden here; useMemo should suffice.",
    },
    schema: null,
    type: "problem",
  },
  name: "prefer-usememo",
  create: (context) => {
    type FunctionState = {
      hasReturn: boolean;
      node: es.Node;
      setterCalls: Set<string>;
      setterDeclarations: Set<string>;
    };
    const functionStates: FunctionState[] = [];
    const effects = new WeakMap<es.Node, es.Node>();

    function enterFunction(
      node:
        | es.ArrowFunctionExpression
        | es.FunctionDeclaration
        | es.FunctionExpression
    ) {
      functionStates.push({
        hasReturn: false,
        node,
        setterCalls: new Set<string>(),
        setterDeclarations: new Set<string>(),
      });
    }

    function exitFunction() {
      const top = functionStates.pop();
      if (!effects.has(top.node)) {
        return;
      }
      if (top.hasReturn) {
        return;
      }
      if (top.setterCalls.size === 1) {
        context.report({
          messageId: "forbidden",
          node: effects.get(top.node),
        });
      }
    }

    function enterReturnStatement() {
      const { length, [length - 1]: top } = functionStates;
      top.hasReturn = true;
    }

    function enterUseEffect(node: es.CallExpression) {
      const [callback, dependencies] = node.arguments;
      if (!callback) {
        return;
      }
      if (
        !isArrowFunctionExpression(callback) &&
        !isFunctionExpression(callback)
      ) {
        return;
      }
      if (!dependencies) {
        return;
      }
      if (!isArrayExpression(dependencies)) {
        return;
      }
      if (dependencies.elements.length === 0) {
        return;
      }
      effects.set(callback, node.callee);
    }

    function enterUseState(node: es.CallExpression) {
      const parent = findParent(node, "VariableDeclarator") as
        | es.VariableDeclarator
        | undefined;
      if (!parent) {
        return;
      }
      if (!isArrayPattern(parent.id)) {
        return;
      }
      const [, setter] = parent.id.elements;
      if (!isIdentifier(setter)) {
        return;
      }
      const { length, [length - 1]: top } = functionStates;
      if (!top) {
        return;
      }
      top.setterDeclarations.add(setter.name);
    }

    function enterCallExpression(node: es.CallExpression) {
      if (!isIdentifier(node.callee)) {
        return;
      }
      const { name } = node.callee;
      const { length, [length - 1]: top } = functionStates;
      if (!top) {
        return;
      }
      if (!effects.has(top.node)) {
        return;
      }
      const { [length - 2]: parent } = functionStates;
      if (!parent) {
        return;
      }
      if (parent.setterDeclarations.has(name)) {
        top.setterCalls.add(name);
      }
    }

    return {
      "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression": enterFunction,
      "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression:exit": exitFunction,
      ReturnStatement: enterReturnStatement,
      "CallExpression[callee.name='useEffect']": enterUseEffect,
      "CallExpression[callee.property.name='useEffect']": enterUseEffect,
      "CallExpression[callee.name='useState']": enterUseState,
      "CallExpression[callee.property.name='useState']": enterUseState,
      CallExpression: enterCallExpression,
    };
  },
});

export = rule;
