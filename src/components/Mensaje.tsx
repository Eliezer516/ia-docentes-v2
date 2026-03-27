import { component$, useStyles$, useSignal, $ } from '@builder.io/qwik'
import MarkdownIt from "markdown-it";
import mathjax3 from 'markdown-it-mathjax3'
import copy from 'copy-text-to-clipboard';
import TablerCopy from '~/icons/TablerCopy.tsx'
import Download from '~/icons/Download.tsx'
import { snapdom } from '@zumer/snapdom'

export const Mensaje = component$(({ mensaje }) => {
  useStyles$(`
    .mensaje {
      overflow-x: auto;
    }
  `)

  const md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true
    }).use(mathjax3)

  const mensajeRef = useSignal()

  const descargarMensaje = $(async (id) => {
    mensajeRef.value?.removeAttribute("q:key")
    mensajeRef.value?.removeAttribute("q:id")
    const result = await snapdom(mensajeRef.value, { width: 690 });
    await result.download({ format: "jpg", filename: id })
  })

  return (
    <div ref={mensajeRef} class={`alert ${mensaje.role === "user" ? "alert-primary" : "alert-secondary"}`}>
      <div class="d-flex align-items-center">
        <h5 class="alert-heading">{mensaje.role === "user" ? "Tu" : "Bot"}</h5>
        <div class="ms-auto">
          <button class="btn btn-primary me-1" onClick$={() => copy(mensaje.content)} >
            <TablerCopy />
          </button>
          <button class="btn btn-primary" onClick$={() => descargarMensaje(mensaje.id)} >
            <Download />
          </button>
        </div>
      </div>
      <hr />
      {mensaje.isLoading ? (
        <div class="d-flex align-items-center">
          <strong role="status">{mensaje.content}</strong>
          <div class="spinner-border spinner-border-sm ms-auto" aria-hidden="true"></div>
        </div>
      ) : (
        <div class="mensaje" dangerouslySetInnerHTML={mensaje.role === "assistant" ? md.render(mensaje.content) : mensaje.content}></div>
      )}
    </div>
  )
})
