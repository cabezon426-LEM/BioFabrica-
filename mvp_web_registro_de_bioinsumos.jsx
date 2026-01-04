import { useState, useEffect } from "react";

export default function BioinsumosApp() {
  const [usuario, setUsuario] = useState({ nombre: "Técnico", rol: "admin" });

  const [bioinsumos, setBioinsumos] = useState(() => {
    const guardado = localStorage.getItem("bioinsumos");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [nombre, setNombre] = useState("");
  const [stockInicial, setStockInicial] = useState("");
  const [diasElaboracion, setDiasElaboracion] = useState("");
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    localStorage.setItem("bioinsumos", JSON.stringify(bioinsumos));
  }, [bioinsumos]);

  useEffect(() => {
    const nuevasAlertas = [];
    const hoy = new Date();

    bioinsumos.forEach((b) => {
      const fechaDisp = new Date(b.fechaDisponible);
      if (hoy >= fechaDisp && !b.alertado) {
        nuevasAlertas.push(`El bioinsumo ${b.nombre} ya está disponible`);
        b.alertado = true;
      }
      if (b.stock <= 5) {
        nuevasAlertas.push(`Stock bajo del bioinsumo ${b.nombre}`);
      }
    });

    setAlertas(nuevasAlertas);
  }, [bioinsumos]);

  const agregarBioinsumo = () => {
    if (!nombre || !stockInicial || !diasElaboracion) return;

    const fechaInicio = new Date();
    const fechaDisponible = new Date();
    fechaDisponible.setDate(fechaInicio.getDate() + Number(diasElaboracion));

    setBioinsumos([
      ...bioinsumos,
      {
        nombre,
        stock: Number(stockInicial),
        fechaInicio,
        fechaDisponible,
        movimientos: [],
        alertado: false
      }
    ]);

    setNombre("");
    setStockInicial("");
    setDiasElaboracion("");
  };

  const registrarSalida = (index, cantidad) => {
    if (cantidad <= 0) return;
    setBioinsumos(bioinsumos.map((b, i) => {
      if (i !== index || b.stock < cantidad) return b;
      return {
        ...b,
        stock: b.stock - cantidad,
        movimientos: [...b.movimientos, { tipo: "Salida", cantidad, fecha: new Date(), usuario: usuario.nombre }]
      };
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sistema Técnico de Bioinsumos</h1>
      <p className="mb-4">Usuario activo: {usuario.nombre} ({usuario.rol})</p>

      {alertas.length > 0 && (
        <div className="bg-yellow-100 border p-3 rounded mb-6">
          <h2 className="font-semibold">Alertas</h2>
          {alertas.map((a, i) => <p key={i}>• {a}</p>)}
        </div>
      )}

      <div className="border p-4 rounded-xl mb-6">
        <h2 className="font-semibold mb-3">Nuevo Lote de Bioinsumo</h2>
        <input className="border p-2 w-full mb-2" placeholder="Nombre del bioinsumo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Stock inicial (L o Kg)" type="number" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Días de elaboración" type="number" value={diasElaboracion} onChange={(e) => setDiasElaboracion(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={agregarBioinsumo}>Guardar lote</button>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Stock, Trazabilidad y Auditoría</h2>
        {bioinsumos.length === 0 && <p className="text-gray-500">No hay bioinsumos cargados</p>}
        {bioinsumos.map((b, i) => {
          const hoy = new Date();
          const disponible = hoy >= new Date(b.fechaDisponible);
          return (
            <div key={i} className="border p-4 rounded mb-4">
              <p><strong>{b.nombre}</strong></p>
              <p>Stock: {b.stock}</p>
              <p>Disponible desde: {new Date(b.fechaDisponible).toLocaleDateString()}</p>
              <p className={disponible ? "text-green-600" : "text-orange-600"}>
                {disponible ? "Disponible" : "En elaboración"}
              </p>

              <button className="bg-red-600 text-white px-3 py-1 rounded mt-2" onClick={() => registrarSalida(i, 1)}>Registrar salida (1)</button>

              <div className="mt-2">
                <p className="font-semibold">Historial:</p>
                {b.movimientos.length === 0 && <p className="text-gray-500">Sin movimientos</p>}
                {b.movimientos.map((m, idx) => (
                  <p key={idx} className="text-sm">{m.tipo} - {m.cantidad} - {new Date(m.fecha).toLocaleDateString()} - {m.usuario}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 mt-6">Esta versión funciona como PWA y puede instalarse en el celular desde el navegador.</p>
    </div>
  );
}
