import React from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MyList from "@/components/MyList";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div>
        <h1>Welcome Back! </h1>
        <SearchBar />
      </div>
      <MyList />
      <Footer />
    </div>
  );
}
