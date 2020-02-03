<?php 
$dir = 'replays';
$a = scandir($dir);
?>

<script type="text/javascript">
    let apiPrefix = "https://osu.ppy.sh/api/";
    let key = '{MYKEY}';
    const url = `${apiPrefix}get_beatmaps?k=${key}`;

    let arr = [];
    let userList = [];

    var fileDir = <?php echo json_encode($a); ?>;
    arr = [...fileDir];
  
    for(let x = 0; x < arr.length; x++){
        let dash = arr[x].indexOf("-");
        let clearString = arr[x].slice(0, dash);
        let list = clearString.replace(/[^a-zA-Z]+/g, '');
        userList.push(list);
    }

    var filtered = userList.filter(function(v){return v!==''});

    for(let x = 0; x < filtered.length; x++){
        fetch(`${apiPrefix}get_user?u=${filtered[x]}&k=${key}`)
        .then(response => response.json())
        .then((data) => 
            {
                var li=document.createElement('li');
                li.innerHTML="<a href=''>"+ data[0].username +"";
                document.getElementById("users").appendChild(li);
            }
        )
        .catch(err => console.log(err))
    }
</script>
