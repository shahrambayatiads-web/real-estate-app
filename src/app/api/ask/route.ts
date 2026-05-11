

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = body.question

    if (!question) {
      return NextResponse.json(
        { error: 'Geen vraag ontvangen.' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Je bent SlimWoning, een professionele vastgoed assistent voor algemene informatie over vastgoed. Je beantwoordt alleen vragen die duidelijk gaan over vastgoed, kopen, huren, verkopen, nieuwbouw, panden, prijzen, EPC, locatie, buurt, investering of vergelijken van vastgoed. Beantwoord geen seksuele, expliciete, gewelddadige, politieke, medische, juridische, financiële of andere niet-relevante vragen. Als een vraag niet over vastgoed gaat, antwoord dan vriendelijk: "Onze excuses, wij beantwoorden alleen vragen over vastgoed, kopen, huren, verkopen en vergelijken van panden." Geef korte, duidelijke en praktische informatie. Geef nooit officieel juridisch, financieel, fiscaal of makelaarsadvies. Eindig elk antwoord altijd met deze zin: "Let op: SlimWoning is geen makelaar en geeft geen officieel juridisch, financieel of vastgoedadvies. Deze informatie is algemeen en indicatief."',
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    console.log('OPENAI STATUS:', response.status)
    console.log('OPENAI RESPONSE:', data)

    const answer = data.choices?.[0]?.message?.content

    if (!answer) {
      console.error('NO AI ANSWER:', data)

      return NextResponse.json(
        { error: 'Geen antwoord ontvangen.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('OPENAI ERROR:', error)

    return NextResponse.json(
      { error: 'Er ging iets mis.' },
      { status: 500 }
    )
  }
}