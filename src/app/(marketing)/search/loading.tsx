export default function Loading() {
  return (
    <section
      id="search-results"
      style={{
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <div className="spinner" />

      <p
        style={{
          fontSize: 14,
          color: "#4b5563",
        }}
      >
        Ищем лучшие предложения по выбранному маршруту…
      </p>
    </section>
  );
}
