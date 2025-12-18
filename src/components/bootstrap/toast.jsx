import { component$, useOn, $, useSignal } from "@builder.io/qwik";
export const Toast = component$(({ text }) => {
  useOn(
    "qvisible",
    $(() => import("bootstrap")),
  );

  const toastLiveExample = useSignal()

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)

  return (
    <div ref={toastLiveExample} class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          {text}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  );
});
