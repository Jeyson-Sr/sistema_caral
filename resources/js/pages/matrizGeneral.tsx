import { Suspense } from "react";
import MatrizGeneralBlock from "@/features/MatrizGeneral/components/MatrizGeneral.block";

export default function matrizGeneral() {
  return (
    <Suspense fallback={<div>Cargando Matriz General...</div>}>
      <MatrizGeneralBlock />
    </Suspense>
  );
}
  