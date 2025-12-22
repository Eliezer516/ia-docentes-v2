import { component$, useStylesScoped$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Form, Link } from '@builder.io/qwik-city';


export const Card = component$(({ tipo, titulo, instruccion, id, editar, eliminar, asistentes }) => {
  const styles = {
    textoLimitado: {
      "display": "-webkit-box",
      "-webkit-line-clamp": "3",
      "-webkit-box-orient": "vertical",
      "overflow": "hidden",
      "text-overflow": "ellipsis"
    },
    cardWidth: {
      "width": "100%",
      "max-width": "500px"
    }
  }

  if (tipo === "asistente") {

    const offcanvasRef = useSignal()
    const offcanvasInstance = useSignal()

    useVisibleTask$( async () => {
      const bootstrap = await import("bootstrap")
      if (offcanvasRef.value) {
        offcanvasInstance.value = new bootstrap.Offcanvas(offcanvasRef.value)
      }
    })

    return (
      <div>
        <article class="card">
          <div class="card-body">
            <h3 class="card-title">{titulo}</h3>
            <p class="card-text" style={styles.textoLimitado}>{instruccion}</p>
          </div>
          <footer class="card-footer text-end">
            <button class="btn btn-primary" style={{ "margin-right": "10px"}} onClick$={() => offcanvasInstance.value?.show()} >Editar</button>
            <button class="btn btn-danger" onClick$={ async () =>  await eliminar.submit({ id })}>Eliminar</button>
          </footer>
        </article>
        <div ref={offcanvasRef} class="offcanvas offcanvas-end" tabindex="-1" id={id} aria-labelledby={`${id}Label`}>
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">Editar asistente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
           <Form action={editar}>
            <input type="text" name="id" id="id" value={id} hidden />
             <div class="mb-3">
               <label>Titulo</label>
               <input class="form-control" value={titulo} type="text" name="titulo" placeholder="Nombre del asistente" />
             </div>
             <div class="mb-3">
               <label>Instruccion</label>
               <textarea class="form-control" value={instruccion} name="instruccion" placeholder="Instrucciones detalladas del bot" rows={7}></textarea>
             </div>
             {/*<button onClick$={() => offcanvasInstance.value?.hide()} class="btn btn-primary">Editar</button>*/}
             <button class="btn btn-primary">Editar</button>
             {editar.value?.success && offcanvasInstance.value?.hide()}
           </Form>
          </div>
        </div>
      </div>
    )
  }

  if (tipo === "asistentes") {
    return (
      <article class="card" style={styles.cardWidth}>
        <div class="card-body">
          <h3 class="card-title">Bienvenido</h3>
          <div class="list-group">
            {asistentes.value.map(asistente => (
              <Link href={`/asistente/${asistente.id}`} key={asistente.id} class="list-group-item list-group-item-action">{asistente.titulo}</Link>
            ))}  
          </div>
        </div>
      </article>
    )
  }
})