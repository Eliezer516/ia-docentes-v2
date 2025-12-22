import { component$ } from '@builder.io/qwik'
import MarkdownIt from "markdown-it";
import { katex } from '@mdit/plugin-katex'

export const Mensaje = component$(({ mensaje }) => {
  const md = MarkdownIt().use(katex, {
    allowInlineWithSpace: true
  })
  return (
    <div class={`alert ${mensaje.role === "user" ? "alert-primary" : "alert-secondary"}`}>
      <h5 class="alert-heading">{mensaje.role === "user" ? "Tu" : "Bot"}</h5>
      <hr />
      {mensaje.isLoading ? (
        <div class="d-flex align-items-center">
          <strong role="status">{mensaje.content}</strong>
          <div class="spinner-border spinner-border-sm ms-auto" aria-hidden="true"></div>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={mensaje.role === "assistant" ? md.render(mensaje.content) : mensaje.content}></div>
      )}
    </div>
  )
})