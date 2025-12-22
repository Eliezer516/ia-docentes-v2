import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { useLocation } from '@builder.io/qwik-city'

// Add bootstrap styles

import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?inline";

export default component$(() => {
  useStyles$(bootstrapStyles);

  const loc = useLocation()

  return (
    <main class="container" style={{ "--bs-gutter-x": "0" }}>
      <Slot />
    </main>
  );
});
