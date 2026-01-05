import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { useLocation } from '@builder.io/qwik-city'

// Add bootstrap styles

import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?inline";

export default component$(() => {
  useStyles$(bootstrapStyles)
  useStyles$(`
    .btn-primary {
      background: #967edb;
      border-color: #967edb;
    }

    .btn-primary:hover {
      background: #7151ce;
      border-color: #7151ce;
    }

    .btn:first-child:active, :not(.btn-check) + .btn:active, .btn:focus-visible {
      background: #5d38c7;
      border-color: #5d38c7;
    }

    .alert-primary, .btn:disabled {
      background: #c2b4ea;
      border-color: #c2b4ea
    }

    .form-control:focus {
      border-color: #7151ce;
    }
  `)

  const loc = useLocation()

  return (
    <main class="container" style={{ "--bs-gutter-x": "0" }}>
      <Slot />
    </main>
  );
});
