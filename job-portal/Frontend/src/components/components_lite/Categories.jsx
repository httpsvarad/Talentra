import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
 
const Category = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Artificial Intelligence Engineer",
  "Cybersecurity Engineer",
  "Product Manager",
  "UX/UI Designer",
  "Graphics Designer",
  "Video Editor",
];

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchjobHandler = (query) => {
      dispatch(setSearchedQuery(query));
      navigate("/browse");
  }
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-center text-blue-600">
          Categories
        </h1>
        <p className="text-center text-gray-600">
          Explore our extensive job market.
        </p>
      </div>
      <Carousel className="w-full   max-w-xl  mx-auto my-10">
        <CarouselContent>
          {Category.map((category, index) => {
            return (
              <div className="flex gap-3">
                <CarouselItem className="md:basis-1/2 lg-basis-1/3 last:mr-0">
                <Button onClick={() => searchjobHandler(category)}>
                  {category}
                </Button>
              </CarouselItem>
              </div>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default Categories;