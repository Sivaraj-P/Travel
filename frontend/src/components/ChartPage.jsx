import  { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import axios from "axios";
import img from "../assets/bg1.svg";
import Navbar from "../components/NavBar"

export default function ChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://10.10.192.179:5001/data")
      .then((response) => {
        const formattedData = response.data.map(item => ({
          date: item.date,
          district: item.district,
          production: item.dailyProduction,
          consumption: item.dailyConsumption,
          charges: item.distributionCharges,
        }));
        setData(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <>
    < Navbar />
    <div className="p-8 min-h-screen bg-gradient-to-r from-indigo-50 to-cyan-50 flex flex-col items-center"style={{ backgroundImage: `url(${img})`,backgroundSize: 'cover',backgroundPosition: 'center',backgroundRepeat: 'no-repeat'}}>

      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide"> Data Visualization</h2>

      <div className="w-full max-w-6xl h-[500px] bg-white shadow-2xl rounded-3xl p-8 border border-gray-100 transition-transform transform hover:scale-105 hover:shadow-3xl">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} className="cursor-pointer">
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
              <XAxis dataKey="district" tick={{ fill: "#6B7280", fontSize: 14 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 14 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: "#FFFFFF", 
                  borderRadius: "12px", 
                  padding: "10px 15px", 
                  border: "none", 
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" 
                }} 
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ top: -10 }} 
                align="right" 
                verticalAlign="top" 
              />
              <Bar dataKey="production" fill="url(#productionGradient)" name="Daily Production" barSize={40} radius={[8, 8, 0, 0]} />
              <Bar dataKey="consumption" fill="url(#consumptionGradient)" name="Daily Consumption" barSize={40} radius={[8, 8, 0, 0]} />
              <Bar dataKey="charges" fill="url(#chargesGradient)" name="Distribution Charges" barSize={40} radius={[8, 8, 0, 0]} />

              {/* Gradient Colors for Bars */}
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.4} />
                </linearGradient>

                <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.4} />
                </linearGradient>

                <linearGradient id="chargesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 animate-pulse">Loading data...</p>
        )}
      </div>
    </div>
    </>
  );
}
