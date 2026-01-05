import { component$, useStylesScoped$, useSignal, useTask$, useVisibleTask$, useStyles$, $ } from '@builder.io/qwik';
import { Form, Link } from '@builder.io/qwik-city';

export const Card = component$(({ tipo, titulo, instruccion, id, editar, eliminar, asistentes }) => {
  useStyles$(`
    .texto-limitado {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis
    }

    .card-width {
      width: 100%;
      max-width: 500px;
      margin: 0 10px;
    }
  `)

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
            <p class="card-text texto-limitado">{instruccion}</p>
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
             <button class="btn btn-primary w-100">Editar</button>
             {editar.value?.success && offcanvasInstance.value?.hide()}
           </Form>
          </div>
        </div>
      </div>
    )
  }

  if (tipo === "asistentes") {
    return (
      <article class="card card-width">
        <div class="card-body">
          <div class="d-flex align-items-center mb-4">
            <span class="fs-2">Bienvenido</span>
            <Link href="/asistentes" class="btn btn-primary ms-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 32 32"><path fill="#fff" d="m23.265 24.381l.9-.894c4.164.136 4.228-.01 4.411-.438l1.144-2.785l.085-.264l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89 2.936-3.038 2.765-3.461l-1.139-2.814c-.171-.422-.236-.587-4.37-.474l-.9-.93a20 20 0 0 0-.141-4.106l-.116-.263l-2.974-1.3c-.438-.2-.592-.272-3.4 2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149 3.182c-.433.175-.586.237-.418 4.437l-.893.89c-4.162-.136-4.226.012-4.407.438l-1.146 2.786l-.09.267l.094.232c.049.12.194.48 2.8 2.962v1.3c-3 2.89-2.935 3.038-2.763 3.462l1.138 2.817c.174.431.236.584 4.369.476l.9.935a20.2 20.2 0 0 0 .137 4.1l.116.265l2.993 1.308c.435.182.586.247 3.386-2.8l1.262.016c2.895 3.09 3.043 3.03 3.466 2.859l2.759-1.115c.436-.173.588-.234.413-4.436m-11.858-6.524a4.957 4.957 0 1 1 6.488 2.824a5.014 5.014 0 0 1-6.488-2.824"></path></svg>
            </Link>
          </div>
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