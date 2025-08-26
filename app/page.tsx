import React from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MyList from "@/components/MyList";
import Footer from "@/components/Footer";


export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="mx-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Welcome Back!</h1>
          <SearchBar />
        </div>
        <div className="mt-12">
          <h1 className="text-3xl md:text-2xl font-extrabold mb-6">My List</h1>
          <MyList />
        </div>
      </div>
      <Footer />
    </div>
  );
}
