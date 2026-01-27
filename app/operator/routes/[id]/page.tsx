export default async function RoutePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return <div>Operator Page {id}</div>;
}
