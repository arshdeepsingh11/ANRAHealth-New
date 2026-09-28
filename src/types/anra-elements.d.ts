// JSX typings for the ANRA motion custom elements (src/lib/motion/*.js).
// All attributes are plain strings, exactly as the design passes them.
import type React from "react";

type AnraEl = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  [attr: string]: unknown;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "anra-chart": AnraEl;
      "anra-dotmap": AnraEl;
      "anra-morph": AnraEl;
      "anra-particles": AnraEl;
      "anra-city": AnraEl;
      "anra-converge": AnraEl;
      "anra-electro": AnraEl;
      "anra-funnel": AnraEl;
      "anra-meteors": AnraEl;
      "anra-typeph": AnraEl;
    }
  }
}


export {};