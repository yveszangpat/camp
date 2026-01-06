import {Card, CardBody, CardFooter, Image} from "@heroui/react";

export default function App() {
  const list = [
    {
      title: "ผู้ใช้ทั้งหมด",
      number: "15",
    },
    {
      title: "นักเรียน",
      number: "20",
    },
    {
      title: "ครู",
      number: "10",
    },
  ];

  return (
    <div className="gap-2 grid grid-cols-1 sm:grid-cols-3 ">
      {list.map((item, index) => (
        /* eslint-disable no-console */
        <Card key={index} isPressable shadow="sm" className="border-1 p-3 rounded-lg w-full" onPress={() => console.log("item pressed")}>
          <CardBody className="overflow-visible p-0">
           
          </CardBody>
          <CardFooter className="text-small flex-col items-start p-0 ">
            <p>{item.title}</p> 
            <p className="text-2xl">{item.number}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}