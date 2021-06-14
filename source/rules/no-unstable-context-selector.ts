/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-react-etc
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import {
  isArrayExpression,
  isArrayPattern,
  isIdentifier,
  isObjectExpression,
  isObjectPattern,
} from "eslint-etc";
import { ruleCreator } from "../utils";

function isRestIdentifier(identifier: es.Identifier, param: es.Parameter) {
  let restElements: es.RestElement[] = [];
  if (isArrayPattern(param)) {
    restElements = param.elements.filter(
      (element) => element?.type === "RestElement"
    ) as es.RestElement[];
  } else if (isObjectPattern(param)) {
    restElements = param.properties.filter(
      (property) => property.type === "RestElement"
    ) as es.RestElement[];
  }
  return restElements.some(
    ({ argument }) =>
      isIdentifier(argument) && argument.name === identifier.name
  );
}

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description:
        "Forbids passing functions that return unstable values to `useContextSelector`.",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      forbidden:
        "Unstable context selectors are forbidden. Avoid creating objects or arrays within selectors.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-unstable-context-selector",
  create: (context) => {
    let callExpression: es.CallExpression | undefined = undefined;
    function enter(node: es.CallExpression) {
      callExpression = node;
    }
    function exit() {
      callExpression = undefined;
    }
    function check(node: es.ArrowFunctionExpression) {
      if (callExpression) {
        const [, selector] = callExpression.arguments;
        if (node !== selector) {
          return;
        }
        const { body } = selector;
        if (isArrayExpression(body) || isObjectExpression(body)) {
          context.report({
            messageId: "forbidden",
            node: selector,
          });
          return;
        }
        const [param] = selector.params;
        if (isIdentifier(body) && isRestIdentifier(body, param)) {
          context.report({
            messageId: "forbidden",
            node: selector,
          });
          return;
        }
      }
    }
    return {
      ArrowFunctionExpression: check,
      "CallExpression[callee.name='useContextSelector']": enter,
      "CallExpression[callee.name='useContextSelector']:exit": exit,
      "CallExpression[callee.property.name='useContextSelector']": enter,
      "CallExpression[callee.property.name='useContextSelector']:exit": exit,
    };
  },
});

export = rule;
