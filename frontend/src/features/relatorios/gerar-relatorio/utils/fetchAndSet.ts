export async function fetchAndSet<T>(
  url: string,
  setter: React.Dispatch<React.SetStateAction<T>>,
  label: string
) {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Erro de API");
    const data = await res.json();
    setter(data.data);
  } catch (err) {
    console.warn(`Usando mock de ${label}:`, err);
    // mantém mocks do estado inicial
  }
}