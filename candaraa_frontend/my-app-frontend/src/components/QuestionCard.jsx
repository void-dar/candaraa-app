import "../styles/QuestionCard.css"

export default function Card(props){
    return(
    <div className="main-container">
        <h2>Region: {props.region}</h2>
        <h3>{props.prompt} Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci, quisquam unde exercitationem dignissimos officiis itaque aut provident. Quod quia distinctio rerum. Sit, delectus et in neque natus accusamus voluptate laboriosam!</h3>
        <input type="button" value="true" name="chooseTrue"/>
        <input type="button" value="false" name="chooseFalse"/>

    </div>
        

    )
}