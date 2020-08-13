/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-react-etc
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/prefer-usememo");
import { ruleTester } from "../utils";

ruleTester({ types: false }).run("prefer-usememo", rule, {
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
        // useEffect async
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
        // useEffect promise
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
        // useEffect callback
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
        // useEffect additional state
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
        // useEffect teardown
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
        // useEffect empty dependencies
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
        // useEffect undefined dependencies
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
  ],
  invalid: [
    fromFixture(stripIndent`
      // useEffect argument
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
      // useEffect variable
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
      // useEffect loop
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
  ],
});
