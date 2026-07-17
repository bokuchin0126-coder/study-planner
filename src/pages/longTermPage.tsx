import useLongTerm from "../hooks/useLongTerm"


export default function LongTermPage() {
  const {

  } = useLongTerm()
  return (
    <>
      <div>
        <div>
          <p>目標</p>
        </div>

        <div>
          <p>期間</p>
        </div>

        <div>
          <p>タスク</p>
        </div>

        <div>
          <p>振り返り</p>
        </div>

        <div>
          <p>達成したタスク</p>
        </div>
      </div>
    </>
  )
}