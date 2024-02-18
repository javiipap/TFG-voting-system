import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import Title from '../components/Title';

export default function Page() {
  return (
    <>
      <Title>Creation</Title>
      <form
        action=""
        className="border shadow-sm rounded-lg p-4 grid grid-cols-2 gap-4"
      >
        <Input
          type="text"
          label="Name"
          name="name"
          placeholder="Enter the name of the election"
        />
        <Input type="date" label="Date" dateTime="Date" />
        <div className="col-span-2">
          <TextArea
            type="text"
            label="Description"
            name="description"
            placeholder="Enter a description for the election"
          />
        </div>
        <div className="col-span-2">
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/80 h-10 px-4 py-2 w-full"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>
    </>
  );
}
