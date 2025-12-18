import { component$, Slot, useStyles$ } from "@builder.io/qwik";

// Add bootstrap styles

import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?inline";

export default component$(() => {
  useStyles$(bootstrapStyles);
  return (
    <>
      <Slot />
    </>
  );
});
