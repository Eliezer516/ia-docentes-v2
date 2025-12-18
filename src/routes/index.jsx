import { component$ } from "@builder.io/qwik";
import { Card } from '~/components/Card.jsx'

export default component$(() => {
  return (
    <main>
      <Card tipo="asistentes" />
    </main>
  );
});

export const head = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
