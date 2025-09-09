import React from 'react'
import { useForm } from 'react-hook-form'
function TestPage() {
  
  const { register, handleSubmit,edit } = useForm();


  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div>
      <h2>Test Page</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Field 1</label>
          <input {...register("field1")} />
        </div>
        <div>
          <label>Field 2</label>
          <input {...register("field2")} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default TestPage