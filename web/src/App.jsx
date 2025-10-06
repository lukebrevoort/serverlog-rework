// import { useState } from 'react'

function App() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-blue-600 text-white py-6 shadow-lg'>
        <div className='container mx-auto px-4'>
          <h1 className='text-3xl font-bold'>SecureLog</h1>
          <p className='text-blue-100 mt-2'>Encryption Services for a Secure Future</p>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        {/* Encryption Section */}
        <section className='mb-8 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Encrypt Data</h2>
          <p className='text-gray-600'>Encryption component will go here</p>
        </section>

        {/* Decryption Section */}
        <section className='mb-8 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Decrypt Data</h2>
          <p className='text-gray-600'>Decryption component will go here</p>
        </section>

        {/* Logs Section */}
        <section className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Activity Logs</h2>
          <p className='text-gray-600'>Logs display component will go here</p>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-gray-800 text-gray-300 py-6 mt-12'>
        <div className='container mx-auto px-4 text-center'>
          <p>&copy; 2025 SecureLog. A non-profit organization dedicated to encryption services.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
