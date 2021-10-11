/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-react-etc
 */

import { TSESLint as eslint } from "@typescript-eslint/experimental-utils";
import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/prefer-usememo");
import { ruleTester } from "../utils";

const tests: {
  valid: eslint.ValidTestCase<never>[];
  invalid: eslint.InvalidTestCase<"forbidden", never>[];
} = {
  valid: [
    {
      code: stripIndent`
        // useMemo
        import React, { useMemo } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const processed = useMemo(() => {
            return process(data);
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // React.useMemo
        import React from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const processed = React.useMemo(() => {
            return process(data);
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with setter in async function
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            async function work() {
              const result = await process(data);
              setProcessed(result);
            }
            run();
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with setter in promise
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            process(data).then(result => setProcessed(result));
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with callback setter
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            process(data, setProcessed);
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with additional setter
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          const [time, setTime] = useState();
          useEffect(() => {
            setProcessed(process(data));
            setTime(Date.now());
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with teardown
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            setProcessed(process(data));
            return () => {};
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with empty dependencies
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            setProcessed(process());
          }, []);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect without dependencies
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            setProcessed(process());
          });
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with conditional setter
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data, flag }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            if (flag) {
              setProcessed(process(data));
            }
          }, [data, flag]);
          return <span>{processed}</span>;
        };
      `,
    },
    {
      code: stripIndent`
        // useEffect with sync and async setters
        import React, { useEffect, useState } from "react";
        import { process } from "./process";
        export function Component({ data }) {
          const [processed, setProcessed] = useState();
          useEffect(() => {
            process(data, setProcessed);
            setProcessed(null);
          }, [data]);
          return <span>{processed}</span>;
        };
      `,
    },
  ],
  invalid: [
    fromFixture(stripIndent`
      // useEffect with call as argument
      import React, { useEffect, useState } from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(() => {
        ~~~~~~~~~ [forbidden]
          setProcessed(process(data));
        }, [data]);
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // useEffect with block-less arrow function
      import React, { useEffect, useState } from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(() => setProcessed(process(data)), [data]);
        ~~~~~~~~~ [forbidden]
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // useEffect with non-arrow function
      import React, { useEffect, useState } from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(function () {
        ~~~~~~~~~ [forbidden]
          setProcessed(process(data));
        }, [data]);
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // useEffect with variable as argument
      import React, { useEffect, useState } from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(() => {
        ~~~~~~~~~ [forbidden]
          const result = process(data);
          setProcessed(result);
        }, [data]);
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // useEffect with a loop
      import React, { useEffect, useState } from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(() => {
        ~~~~~~~~~ [forbidden]
          let result;
          for (let i = 0; i < 1e6; ++i) {
            result = process(data);
          }
          setProcessed(result);
        }, [data]);
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // React.useEffect
      import React from "react";
      import { process } from "./process";
      export function Component({ data }) {
        const [processed, setProcessed] = React.useState();
        React.useEffect(() => {
        ~~~~~~~~~~~~~~~ [forbidden]
          setProcessed(process(data));
        }, [data]);
        return <span>{processed}</span>;
      };
    `),
    fromFixture(stripIndent`
      // useEffect within a hook
      import { useEffect, useState } from "react";
      import { process } from "./process";
      export function useHook({ data }) {
        const [processed, setProcessed] = useState();
        useEffect(() => {
        ~~~~~~~~~ [forbidden]
          setProcessed(process(data));
        }, [data]);
        return processed;
      };
    `),
  ],
};

ruleTester({
  typeScript: true,
  types: false,
}).run("prefer-usememo (ts)", rule, tests);

ruleTester({
  typeScript: false,
}).run("prefer-usememo (js)", rule, tests);
