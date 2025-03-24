
import React, { useEffect, useState } from "react";
import NavBar from "../Components/Navbar/Navbar";
import CollapsibleSidebar from "../Components/Sidebar";
import axios from 'axios';
import Papa from 'papaparse';
import UploadModal from "../Components/UploadModal";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const UploadPage = () => {
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/user-info/", {
          method: "GET",
          credentials: "include",
          mode: "cors",
        });

        console.log("Response Status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetch User Data:", data);
          setUsername(data.username);
        } else {
          console.error("Failed to fetch user info. Status:", response.status);
          const errorData = await response.json();
          console.error("Error response:", errorData);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Reset file and data when file type changes
  useEffect(() => {
    if (fileType) {
      setFile(null); // Clear the file
      setCsvData([]); // Clear CSV data
      setColumns([]); // Clear columns
      setRowsCount(0); // Reset row count
      setTotalDataPoints(0); // Reset data points
      setJsonLink(""); // Clear JSON link
      setError(""); // Clear any errors
    }
  }, [fileType]); // Reset when fileType changes

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      if (fileType === "csv") {
        Papa.parse(selectedFile, {
          complete: (result) => {
            if (result.data.length > 0) {
              const totalRows = result.data.length;
              const totalCols = Object.keys(result.data[0]).length;

              setColumns(Object.keys(result.data[0]));
              setCsvData(result.data.slice(0, 5));
              setRowsCount(totalRows);
              setTotalDataPoints(totalCols * totalRows);
              setShowModal(true);
            }
          },
          header: true,
          skipEmptyLines: true,
        });
      } else if (fileType === "json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target.result);
            if (Array.isArray(jsonData)) {
              const totalRows = jsonData.length;
              const totalCols = Object.keys(jsonData[0]).length;

              setColumns(Object.keys(jsonData[0]));
              setCsvData(jsonData.slice(0, 5));
              setRowsCount(totalRows);
              setTotalDataPoints(totalCols * totalRows);
              setShowModal(true);
            } else {
              setError("Invalid JSON file. Expected an array of objects.");
            }
          } catch (error) {
            setError("Failed to parse JSON file. Please check the file format.");
          }
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleJsonLink = async (url) => {
    try {
      const response = await axios.get(url);
      const jsonData = response.data;

      // Validate JSON data structure
      if (!Array.isArray(jsonData)) {
        throw new Error("Invalid JSON data. Expected an array of objects.");
      }

      if (jsonData.length === 0) {
        throw new Error("JSON data is empty.");
      }

      const totalRows = jsonData.length;
      const totalCols = Object.keys(jsonData[0]).length;

      setColumns(Object.keys(jsonData[0]));
      setCsvData(jsonData.slice(0, 5));
      setRowsCount(totalRows);
      setTotalDataPoints(totalCols * totalRows);
      setShowModal(true);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching JSON data:", error);
      setError("Invalid JSON link or data format. Please check the URL and try again."); // Set error message
      setCsvData([]); // Clear any previous data
      setColumns([]); // Clear columns
      setRowsCount(0); // Reset row count
      setTotalDataPoints(0); // Reset data points
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a CSV file before proceeding!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        console.log("Uploading file...");
        const response = await axios.post("http://127.0.0.1:8000/upload-csv/", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });

        if (response.status === 200) {
          console.log("Upload successful", response.data);
      } else {
          console.error("Upload failed. Status:", response.status);
      }
      
  } catch (error) {
    console.error("Upload error:", error);
  }
};


  const handleConfirm = () => {
    if (fileType === "json-link") {
      // For JSON links, we don't need a file
      console.log("JSON link data confirmed:", csvData);
      setShowModal(false);
      return;
    }

    if (!file) return;
    console.log("File to be uploaded:", file.name);
    setShowModal(false);
  };

  const navigate = useNavigate();

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setIsFileTypeSelected(false); // Reset transition state
    setResetTransition(true); // Trigger transition reset
    setTimeout(() => {
      setIsFileTypeSelected(true); // Re-enable transition
      setResetTransition(false); // Reset the reset flag
    }, 10); // Small delay to allow re-render
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-uploadPage bg-gray-900 text-white font-inter">
      <div className="ml-10 w-screen">
        <CollapsibleSidebar />
      </div>

      <div className="pb-12">
        <div className="mt-10 py-9 bg-logo bg-no-repeat bg-cover bg-center outline-transparent w-64 rounded-xl transition-all duration-300"></div>
      </div>

      <div className="absolute top-5 right-10 text-2xl font-bold text-amber-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.50)]">
        Welcome, {username || "Guest"}!
      </div>

      <div className="text-center">
        <h1 className="text-5xl font-bold">
          Upload your database to unlock
          <br /> powerful insights!
        </h1>
        <p className="text-xl text-gray-400 mt-9 mb-16">
          Turn Your Data into Smart Decisions
        </p>
      </div>

      <div className="w-2/5 mt-8 text-left">
        <p className="text-lg mb-2">Upload CSV File</p>
        <div className="border-dashed border-2 border-gray-400 bg-gray-900 bg-opacity-25 hover:border-white hover:bg-gray-900 hover:bg-opacity-50 transition duration-500 rounded-lg text-center p-6 relative">
          <div className="mx-auto mb-4 bg-uploadIcon bg-contain bg-center bg-no-repeat py-10 w-14" />
          <label htmlFor="upload-csv" className="cursor-pointer block text-gray-300 hover:text-white transition">
            {file ? (
              <div className="flex items-center justify-center">
                <svg fill="currentColor" className="w-6 h-6 text-green-500 mr-2" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6H5zm6 1.5V9h5.5L11 4.5zM6 10h6v2H8v1h4v2H8v1h4v2H6v-2h2v-1H6v-2h2v-1H6v-2zm9 1h3v1h-2v1h1v1h-1v1h2v1h-3v-5z" />
                </svg>
                <span className="text-gray-300">{file.name}</span>
                <button onClick={() => document.getElementById("upload-csv").click()} className="ml-4 text-sm text-blue-500 hover:text-blue-300">
                  Change File
                </button>
              </div>
            ) : (
              "Drag and drop or click to upload"
            )}
          </label>
          <input type="file" onChange={handleFileChange} id="upload-csv" accept=".csv" className=" z-0 absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>} 
        </div>
<div className="w-full mt-6">
  <label className="block text-lg font-semibold mb-1">Company Name</label>
        <input
  type="text"
  className={`w-full p-3 bg-gray-900 bg-opacity-25 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-double focus:outline-4 outline-white hover:border-white transition duration-300 ${
    errors.companyName ? "border-red-500" : "border-gray-400"
  }`}
  placeholder="Enter company name"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
/>
{errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
</div>
<div className="w-full mt-4">
  <label className="block text-lg font-semibold mb-1">Contact Number</label>
<input
  type="text"
  className={`w-full p-3 bg-gray-900 bg-opacity-25 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-double focus:outline-4 outline-white hover:border-white transition duration-300 ${
    errors.contactNumber ? "border-red-500" : "border-gray-400"
  }`}
  placeholder="Enter contact number"
  value={contactNumber}
  onChange={(e) => setContactNumber(e.target.value)}
/>
{errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
</div>
<button
  onClick={async () => {
    let newErrors = {};

    if (!companyName.trim()) newErrors.companyName = "Company name is required!";
    if (!contactNumber.trim()) newErrors.contactNumber = "Contact number is required!";
    if (!file) newErrors.file = "Please upload a CSV file!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if valid

    try {
      await handleUpload();
      toast.success("Upload successful!", {  // ✅ Ginawang Toast notification
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
      navigate("/Display-Page", { state: { csvData, columns } });
    }, 3500);
    } catch (error) {
      toast.error("Upload failed. Please try again.", {  // ✅ Error toast
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      console.error("Upload failed:", error);
    }
  }}

  className="w-full mt-6 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
>
  Get your Insights!
</button>

<ToastContainer /> {/* ✅ Toast container */}


      </div>

      <div className="h-32"></div>

      {/* Separated modal component */}
      <UploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        file={file}
        columns={columns}
        csvData={csvData}
        rowsCount={rowsCount}
        totalDataPoints={totalDataPoints}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default UploadPage;