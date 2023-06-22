import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  //Es un estado que almacena una matriz de objetos que representan
  //los componentes movibles. Cada objeto tiene propiedades como
  // id, top, left, width, height, color y updateEnd.
  // Los componentes se agregan y eliminan de esta matriz utilizando 
  //las funciones addMoveable y deleteMoveable.
  const [selected, setSelected] = useState(null);
  //Es un estado que almacena el identificador del componente seleccionado actualmente.
  const addMoveable = () => {
    // Crear un nuevo componente Moveable y agregarlo al array

    //Esta función se llama al hacer clic en el botón "Add Moveable". 
    //Agrega un nuevo componente movible a la matriz moveableComponents 
    //con valores aleatorios para las propiedades top, left, width, height, color e id.
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    //Esta función se utiliza para actualizar un componente movible existente en la matriz moveableComponents.
    //Recibe el id del componente y un objeto newComponent que contiene las nuevas propiedades a actualizar. 
    //Si se pasa updateEnd como true, se establece la propiedad updateEnd en el componente actualizado.
    const updatedMoveables = moveableComponents.map((moveable) => {
      if (moveable.id === id) {
        const updatedComponent = { id, ...newComponent, updateEnd };
        return checkBounds(updatedComponent);
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const deleteMoveable = (id) => {
    //Esta función se utiliza para eliminar un componente movible de la matriz moveableComponents según su id.
    const filteredMoveables = moveableComponents.filter((moveable) => moveable.id !== id);
    setMoveableComponents(filteredMoveables);
  };

  const checkBounds = (component) => {
    //verificar y ajustar la posición de un componente movible dentro de los límites del
    //área de visualización. Asegura que el componente no se salga de los límites definidos 
    //por el elemento con el id "parent".

    const parentBounds = document.getElementById("parent").getBoundingClientRect();
    const { top, left, width, height } = component;

    let adjustedTop = top;
    let adjustedLeft = left;

    if (top < 0) {
      adjustedTop = 0;
    } else if (top + height > parentBounds.height) {
      adjustedTop = parentBounds.height - height;
    }

    if (left < 0) {
      adjustedLeft = 0;
    } else if (left + width > parentBounds.width) {
      adjustedLeft = parentBounds.width - width;
    }

    return { ...component, top: adjustedTop, left: adjustedLeft };
  };

  const handleResizeStart = (index, e) => {
    // Verificar si el redimensionamiento proviene del mango izquierdo
    const [handlePosX, handlePosY] = e.direction;

    if (handlePosX === -1) {
      // Guardar los valores iniciales de left y width del componente Moveable
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Configurar el controlador de evento onResize para actualizar el valor de left en función del cambio en width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            checkBounds={checkBounds}
            deleteMoveable={deleteMoveable}
          />
        ))}
      </div>
      <div id="list">
        <h3>Components:</h3>
        <ul>
          {moveableComponents.map((item) => (
            <li key={item.id}>
              Component {item.id}
              <button onClick={() => deleteMoveable(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  checkBounds,
  deleteMoveable,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  const fetchImage = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/photos");
      const data = await response.json();
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex].url;
    } catch (error) {
      console.log("Error fetching image:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      const imageUrl = await fetchImage();
      if (imageUrl) {
        setNodoReferencia((prevState) => ({ ...prevState, imageUrl }));
      }
    };

    loadImage();
  }, []);

  const onResize = (e) => {
    const { width, height, drag } = e;

    updateMoveable(id, {
      top,
      left,
      width,
      height,
      color,
    });

    const translateX = drag.beforeTranslate[0];
    const translateY = drag.beforeTranslate[1];

    setNodoReferencia((prevState) => ({
      ...prevState,
      translateX,
      translateY,
      top: prevState.top + translateY,
      left: prevState.left + translateX,
    }));

    ref.current.style.width = `${width}px`;
    ref.current.style.height = `${height}px`;
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
  };

  const onResizeEnd = (e) => {
    const { width, height, drag } = e.lastEvent;

    if (drag) {
      const absoluteTop = top + drag.beforeTranslate[1];
      const absoluteLeft = left + drag.beforeTranslate[0];

      const updatedComponent = checkBounds({
        id,
        top: absoluteTop,
        left: absoluteLeft,
        width,
        height,
        color,
      });

      updateMoveable(updatedComponent.id, updatedComponent, true);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          backgroundImage: `url(${nodoReferencia.imageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          const { top, left, width, height } = e;
          const parentBounds = document.getElementById("parent").getBoundingClientRect();

          let adjustedTop = top;
          let adjustedLeft = left;


          if (top < 0) {
            adjustedTop = 0;
          } else if (top + height > parentBounds.height) {
            adjustedTop = parentBounds.height - height;
          }

          if (left < 0) {
            adjustedLeft = 0;
          } else if (left + width > parentBounds.width) {
            adjustedLeft = parentBounds.width - width;
          }

          updateMoveable(id, {
            top: adjustedTop,
            left: adjustedLeft,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        dragArea={true}
        origin={false}
        snappable={true}
        snapCenter={true}
        snapElement={true}
        snapVertical={true}
        snapHorizontal={true}
      />
    </>
  );
};

export default App;
