/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-react-etc
 */

import { TSESLint as eslint } from "@typescript-eslint/experimental-utils";
import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/no-unstable-context-selector");
import { ruleTester } from "../utils";

const tests: {
  valid: eslint.ValidTestCase<never>[];
  invalid: eslint.InvalidTestCase<"forbidden", never>[];
} = {
  valid: [
    {
      code: stripIndent`
        // everything
        const value = useContextSelector(context, value => value);
      `,
    },
    {
      code: stripIndent`
        // property
        const value = useContextSelector(context, value => value.property);
      `,
    },
    {
      code: stripIndent`
        // destructured property
        const value = useContextSelector(context, ({ property }) => property);
      `,
    },
    {
      code: stripIndent`
        // destructured array element
        const value = useContextSelector(context, ([element]) => element);
      `,
    },
    {
      code: stripIndent`
        // property with namespace
        const value = hooks.useContextSelector(context, value => value.property);
      `,
    },
  ],
  invalid: [
    fromFixture(stripIndent`
      // array
      const value = useContextSelector(context, value => [value.a, value.b]);
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array with namespace
      const value = hooks.useContextSelector(context, value => [value.a, value.b]);
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured array
      const value = useContextSelector(context, ([a, b]) => [a, b]);
                                                ~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured properties
      const value = useContextSelector(context, ({ a, b }) => [a, b]);
                                                ~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured rest array
      const value = useContextSelector(context, ([a, b, ...rest]) => rest);
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // properties
      const value = useContextSelector(context, value => ({ a: value.a, b: value.b }));
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured array
      const value = useContextSelector(context, ([a, b]) => ({ a, b }));
                                                ~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured properties
      const value = useContextSelector(context, ({ a, b }) => ({ a, b }));
                                                ~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
    fromFixture(stripIndent`
      // array from destructured rest properties
      const value = useContextSelector(context, ({ a, b, ...rest }) => rest);
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~ [forbidden]
    `),
  ],
};

ruleTester({
  typeScript: true,
  types: false,
}).run("no-unstable-context-selector (ts)", rule, tests);

ruleTester({
  typeScript: false,
}).run("no-unstable-context-selector (js)", rule, tests);
