import React, { useState, ChangeEvent } from 'react';

// Define a simple Loader component
const Loader: React.FC = () => (
    <div className="mx-auto mt-8 border-8 border-gray-200 border-t-blue-500 rounded-full w-16 h-16 animate-spin"></div>
);

// Define the shape of the API response
interface SearchResponse {
    result_paths: string[];
}

// Main App Component
const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [queryImagePreview, setQueryImagePreview] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL: string = 'http://127.0.0.1:8000';

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setQueryImagePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSearch = async () => {
        if (!file) {
            alert('Please select an image file first.');
            return;
        }

        // Reset state for new search
        setIsLoading(true);
        setSearchResults([]);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/search-high-res/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Search request failed with status: ${response.status}`);
            }

            const data: SearchResponse = await response.json();
            setSearchResults(data.result_paths || []);

        } catch (err) {
            console.error('An error occurred:', err);
            if (err instanceof Error) {
                setError(`An error occurred during the search: ${err.message}. Please check the console and ensure the API server is running.`);
            } else {
                setError('An unknown error occurred during the search.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Visual Search Engine</h1>
                    <p className="text-lg text-gray-600 mt-2">Upload an image of a clothing item to find similar products.</p>
                </header>

                <main className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <div className="mb-6">
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Choose an image:</label>
                        <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    <button 
                        onClick={handleSearch} 
                        disabled={isLoading || !file}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                    
                    {isLoading && <Loader />}
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </main>

                <div className="mt-12">
                    {queryImagePreview && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-4 text-center">Your Image</h2>
                            <div className="flex justify-center">
                                <img src={queryImagePreview} className="max-w-xs rounded-lg shadow-md" alt="Query Preview" />
                            </div>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-center">Similar Items Found</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {searchResults.map((path, index) => {
                                    const encodedPath = encodeURIComponent(path);
                                    const imageUrl = `${API_BASE_URL}/get-image-by-path/?path=${encodedPath}`;
                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                            <img 
                                                src={imageUrl} 
                                                alt={`Result ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
