import { component$, useStyles$ } from '@builder.io/qwik'
import MarkdownIt from "markdown-it";
import { katex } from '@mdit/plugin-katex'
import copy from 'copy-text-to-clipboard';
import TablerCopy from '~/icons/TablerCopy.tsx'

export const Mensaje = component$(({ mensaje }) => {
  useStyles$(`
    .mensaje {
      overflow-x: auto;
    }
  `)
  const md = MarkdownIt().use(katex, {
    allowInlineWithSpace: true
  })
  return (
    <div class={`alert ${mensaje.role === "user" ? "alert-primary" : "alert-secondary"}`}>
      <div class="d-flex align-items-center">
        <h5 class="alert-heading">{mensaje.role === "user" ? "Tu" : "Bot"}</h5>
        <button class="btn btn-primary ms-auto" onClick$={() => copy(mensaje.content)} >
          <TablerCopy />
        </button>
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