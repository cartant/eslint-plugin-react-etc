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
      description: "Forbids `useEffect` when `useMemo` should suffice.",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      forbidden:
        "Side effects that perform only a set-state call are inefficient; `useMemo` would be a better choice.",
    },
    schema: [],
    type: "problem",
  },
  name: "prefer-usememo",
  create: (context) => {
    // This rule uses a simple heuristic to determine whether or not a
    // useEffect hook should be replaced with a useMemo hook. A failure will be
    // effected if the useEffect hook:
    // - makes a single, clearly-synchronous, unconditional call to a single
    //   useState setter;
    // - does not reference or call additional useState setters;
    // - has some dependencies;
    // - does not return a teardown.

    type EffectScope = {
      body: es.Node;
      calledSetterCount: number;
      callee: es.Node;
      node: es.Node;
      referencedSetterCount: number;
    };
    type FunctionScope = {
      hasReturn: boolean;
      node: es.Node;
    };
    type StateScope = {
      node: es.Node;
      setterNames: Set<string>;
    };

    const effectFunctionsToCallees = new WeakMap<es.Node, es.Node>();
    const effectScopes: EffectScope[] = [];
    const functionScopes: FunctionScope[] = [];
    const stateScopes: StateScope[] = [];

    function currentScope<Scope>(scopes: Scope[]): Scope | undefined {
      const { length, [length - 1]: scope } = scopes;
      return scope;
    }

    function enterFunction(
      node:
        | es.ArrowFunctionExpression
        | es.FunctionDeclaration
        | es.FunctionExpression
    ) {
      const functionScope = {
        hasReturn: false,
        node,
      };
      functionScopes.push(functionScope);

      const effectCallee = effectFunctionsToCallees.get(node);
      if (effectCallee) {
        const effectScope = {
          body: node.body,
          calledSetterCount: 0,
          callee: effectCallee,
          node,
          referencedSetterCount: 0,
        };
        effectScopes.push(effectScope);
      }
    }

    function exitFunction(
      node:
        | es.ArrowFunctionExpression
        | es.FunctionDeclaration
        | es.FunctionExpression
    ) {
      const functionScope = functionScopes.pop();

      const stateScope = currentScope(stateScopes);
      if (stateScope?.node === node) {
        stateScopes.pop();
      }

      const effectScope = currentScope(effectScopes);
      if (effectScope?.node === node) {
        effectScopes.pop();
        const { calledSetterCount, callee, referencedSetterCount } =
          effectScope;
        if (functionScope?.hasReturn) {
          return;
        }
        if (calledSetterCount !== 1) {
          return;
        }
        if (referencedSetterCount !== 1) {
          return;
        }
        context.report({
          messageId: "forbidden",
          node: callee,
        });
      }
    }

    function enterReturnStatement() {
      const functionScope = currentScope(functionScopes);
      if (functionScope) {
        functionScope.hasReturn = true;
      }
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
      effectFunctionsToCallees.set(callback, node.callee);
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
      if (!setter || !isIdentifier(setter)) {
        return;
      }
      const functionScope = currentScope(functionScopes);
      if (!functionScope) {
        return;
      }
      let stateScope = currentScope(stateScopes);
      if (!stateScope) {
        stateScope = {
          node: functionScope.node,
          setterNames: new Set<string>(),
        };
        stateScopes.push(stateScope);
      } else if (stateScope.node !== functionScope.node) {
        stateScope = {
          node: functionScope.node,
          setterNames: new Set<string>(stateScope.setterNames),
        };
        stateScopes.push(stateScope);
      }
      stateScope.setterNames.add(setter.name);
    }

    function enterCallExpression(node: es.CallExpression) {
      const { callee } = node;
      if (!isIdentifier(callee)) {
        return;
      }
      const stateScope = currentScope(stateScopes);
      if (!stateScope) {
        return;
      }
      const effectScope = currentScope(effectScopes);
      if (!effectScope) {
        return;
      }
      // Find the parent block statement - if there is one - but bail if there
      // are intermediate conditional statements, etc.
      const block = findParent(node, (type) => {
        switch (type) {
          case "ExpressionStatement":
            return "continue";
          case "BlockStatement":
            return "return";
          default:
            return "break";
        }
      });
      const { body } = effectScope;
      if (node !== body && block !== body) {
        return;
      }
      const { name } = callee;
      if (stateScope.setterNames.has(name)) {
        ++effectScope.calledSetterCount;
      }
    }

    function enterIdentifier(node: es.Identifier) {
      const stateScope = currentScope(stateScopes);
      if (!stateScope) {
        return;
      }
      const effectScope = currentScope(effectScopes);
      if (!effectScope) {
        return;
      }
      const { name } = node;
      if (stateScope.setterNames.has(name)) {
        ++effectScope.referencedSetterCount;
      }
    }

    return {
      "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression":
        enterFunction,
      "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression:exit":
        exitFunction,
      ReturnStatement: enterReturnStatement,
      "CallExpression[callee.name='useEffect']": enterUseEffect,
      "CallExpression[callee.property.name='useEffect']": enterUseEffect,
      "CallExpression[callee.name='useState']": enterUseState,
      "CallExpression[callee.property.name='useState']": enterUseState,
      CallExpression: enterCallExpression,
      Identifier: enterIdentifier,
    };
  },
});

export = rule;
