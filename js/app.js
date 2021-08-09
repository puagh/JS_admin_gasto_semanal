//Variables y selectores globales
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
let presupuesto;


//Eventos
eventListeners();
function eventListeners(){
    //Preguntar presupuesto cuando carga por completo la página
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    //Escuchar submit para agregar un gasto
    document.addEventListener('submit', agregarGasto);
}

//Clases
class Presupuesto{
    //Constructor que recibe el presupuesto ingresado por el usuario 
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante(){
        //Utilización de reduce para realizar la suma de las cantidades de cada objeto en el arreglo gastos
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
        // console.log(this.restante);
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }

}

class UI{
    //Insertar en HTML el presupuesto y el restante
    insertarPresupuesto(cantidad){
        //Destruncturing
        const {presupuesto, restante} = cantidad;

        //Agregar al html las cantidades
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        //Crear div del mensaje
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        //Agregar mensaje
        divMensaje.textContent = mensaje;

        //Insertar en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        //Borrar el mensaje en 3 seg
        setTimeout(() => {
            divMensaje.remove();
        }, 2000);
    }

    mostrarGastos(gastos){
        //Llamar el método para limpiar html
        this.limpiarHTML();

        //Iterar sobre los gastos
        gastos.forEach(gasto => {
            const {cantidad, nombre, id} = gasto;
            //Crear elemento li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            //Agregar HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad} </span>`;
            
            //Botón para agregar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }

            nuevoGasto.appendChild(btnBorrar);

            //Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        //Comrpobar el 25%
        if ((presupuesto / 4) > restante ){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if((presupuesto / 2 > restante)){
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        //Si el total es 0 o menor
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        } else{
            formulario.querySelector('button[type="submit"]').disabled = false;
        }


    }
}


//Instanciar
const ui = new UI();


//Funciones

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto? (sólo números)');
    // console.log(typeof(presupuestoUsuario));

    //Validar que el usuario no envie la entrada vacía o cancele el prompt
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ){
        // preguntarPresupuesto();
        window.location.reload();
    }

    //instanciar el presupuesto
    presupuesto = new Presupuesto(presupuestoUsuario);
    // co7nsole.log(presupuesto);

    ui.insertarPresupuesto(presupuesto);
}

//Añade gastos
function agregarGasto(e){
    e.preventDefault();
    
    //Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value; 
    const cantidad = Number(document.querySelector('#cantidad').value);
    
    //Validar
    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    //Generar un objeto con el gasto
    const gasto = {nombre, cantidad, id: Date.now()}

    //Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    ui.imprimirAlerta('Gasto agregado correctamente');

    //Imprimir los gastos y el restante
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    //Reinicia el formulario
    formulario.reset();
}

function eliminarGasto(id){

    //ELimina los gastos del objeto
    presupuesto.eliminarGasto(id);

    //elimina los gastos del html
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}