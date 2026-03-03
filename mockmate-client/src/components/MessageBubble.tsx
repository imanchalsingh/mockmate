type Props = {
  role: "user" | "ai";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  return (
    <div
      className={`p-3 rounded-lg max-w-md my-2 ${
        role === "user"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-gray-200 text-black"
      }`}
    >
      {content}
    </div>
  );
}