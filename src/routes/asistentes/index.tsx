import styles from "./index.css?inline";
import { component$, useTask$, useSignal, useStylesScoped$ } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { Card, Heading, Button, Navbar, Modal } from 'flowbite-qwik'

type Asistente = {
  id: string;
  titulo: string;
  instruccion: string;
}

export const useObtenerAsistentes = routeLoader$(async () => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  const response = await fetch(apiUrl);
  const data = await response.json()
  return data
});

export default component$(() => {
  useStylesScoped$(styles)

  const asistentes = useObtenerAsistentes();

  const defaultModalVisible = useSignal(false)
  useTask$(() => {
    server$(() => {
      // console.log(asistentes.value);
    })();
  });
  return (
    <section class="section bright">
      <Navbar separator>
        <Navbar.Brand>
          <Heading tag="h4">
            Asistentes
          </Heading>
        </Navbar.Brand>
        <div class="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
          <Button onClick$={ () => defaultModalVisible.value = true}>Start</Button>
        </div>
      </Navbar>
      <Modal
        header={<div class="flex items-center text-lg">Añadir nuevo asistente</div>}
        bind:show={defaultModalVisible}
        onClickOutside$={() => {
          console.log('click outside !')
        }}
      >
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are
          updating their terms of service agreements to comply.
        </p>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data
          rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally
          affect them.
        </p>
      </Modal>
      <div className="contenedor-asistentes">
        {asistentes.value.map((asistente: Asistente) => (
          <Card key={asistente.id}>
            <Heading tag="h4">{asistente.titulo}</Heading>
            <div className="flex items-center justify-between">
              <Button>Editar</Button>
              <Button>Eliminar</Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
});