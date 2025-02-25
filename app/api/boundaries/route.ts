// /app/api/boundaries/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Use process.cwd() to get the correct project root
    const filePath = path.join(process.cwd(), 'src/lib/ghana-post/data/district-boundaries.json')
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      console.error('District boundaries file not found:', filePath)
      return new NextResponse(
        JSON.stringify({ error: 'District boundaries data not found' }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Read and parse the file
    const rawData = await fs.readFile(filePath, 'utf8')
    let boundaries

    try {
      boundaries = JSON.parse(rawData)
    } catch (error) {
      console.error('Error parsing boundaries JSON:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid boundaries data format' }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Return the boundaries data
    return new NextResponse(
      JSON.stringify(boundaries),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  } catch (error) {
    console.error('Error loading boundaries:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load boundaries data' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}







// // /app/api/boundaries/route.ts
// import { NextResponse } from 'next/server'
// import { promises as fs } from 'fs'
// import path from 'path'
// import { cache } from 'react'

// // Cache the file reading operation
// const getBoundaries = cache(async () => {
//   const filePath = path.join(process.cwd(), 'src/lib/ghana-post/data/district-boundaries.json')
//   const data = await fs.readFile(filePath, 'utf8')
//   return JSON.parse(data)
// })

// export async function GET() {
//   try {
//     const boundaries = await getBoundaries()
//     return NextResponse.json(boundaries)
//   } catch (error) {
//     console.error('Failed to load boundaries:', error)
//     return new NextResponse('Internal Server Error', { status: 500 })
//   }
// }