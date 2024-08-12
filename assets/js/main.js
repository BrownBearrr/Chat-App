// Khởi tạo để sử dụng FireBase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth , createUserWithEmailAndPassword , signInWithEmailAndPassword , signOut , onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // nhúng các hàm của firebase-authentication vào trong web 
import { getDatabase , ref , set , push, onChildAdded , get , child ,remove , onChildRemoved , } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"; // nhúng các hàm của firebase vào trong web 
import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'

const firebaseConfig = {
  apiKey: "AIzaSyAWZePpeJze2kZgyqnDWzohJ5A6hcfTFeQ",
  authDomain: "project-4-85a69.firebaseapp.com",
  projectId: "project-4-85a69",
  storageBucket: "project-4-85a69.appspot.com",
  messagingSenderId: "475985611391",
  appId: "1:475985611391:web:729a44adc0efb3c65d4d4a",
  databaseURL : "https://project-4-85a69-default-rtdb.asia-southeast1.firebasedatabase.app" , // Đổi đường link database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// End khởi tạo để sử dụng FireBase

const auth = getAuth(app) // Khởi tạo Authen
const db = getDatabase() ; // Khởi tạo Database
const dbRef = ref(getDatabase())
const chatRef = ref(db , 'chats/') ;


// Tính năng đăng ký  
const formRegister = document.querySelector('#form-register') // Lấy ra form đăng ký
if(formRegister) { //nếu có form đăng ký 
  formRegister.addEventListener('submit' , (event) => { // bắt sự kiện submit form đăng ký
    event.preventDefault() ; //Ngăn hành vi mặc định-load lại trang

    const fullName = event.target.fullName.value // Lấy ra thông tin từ form 
    const email = event.target.email.value // Lấy ra thông tin từ form 
    const password = event.target.password.value  // Lấy ra thông tin từ form 
   

    createUserWithEmailAndPassword(auth, email, password) // Gọi đến hàm có sẵn của firebase để tạo tài khoản
      .then((userCredential) => { // chờ tạo tài khoản ở authen 
        const user = userCredential.user; // Lấy ra thông tin user
        
        set(ref(db, "users/" +user.uid ) , {
          fullName : fullName // gửi full name lên data
        }) // hàm set để tạo mới thông tin cho database - tham số 1 : tham chiếu đến bảng nào và id là gì - tham số 2 : 1 object gồm data muốn gửi lên database
        
          .then(() => { // chờ tạo xong thông tin user ở database
            window.location.href = "index.html" // chuyển sang trang chủ
          }) ;

      })
      .catch((error) => {
        console.log(error)
      });

  })
} 

// Tính năng đăng nhập
const formLogin = document.querySelector("#form-login") // Lấy ra form đăng nhập
if(formLogin) { // nếu có form đăng nhập
  formLogin.addEventListener('submit', (event) => {
    event.preventDefault() ; // Ngăn chặn hành vi mặc định

    const email = event.target.email.value ;
    const password = event.target.password.value ;

    signInWithEmailAndPassword(auth, email, password) // Gọi đến hàm có sẵn của firebase để đăng nhập
      .then((userCredential) => { // Chờ đăng nhập xong
        const user = userCredential.user; // Lấy ra thông tin user
        if(user) {
          window.location.href = "index.html" ; // Chuyển sang trang chủ
        }
      })
      .catch((error) => {
        alert("tài khoản hoặc mật khẩu không chính xác")
      });


  })
}

// Tính năng đăng xuất 
const buttonLogout = document.querySelector("[button-logout]") // Lấy ra nút đăng xuất
if(buttonLogout) { // Nếu có nút đăng xuất
  buttonLogout.addEventListener("click" , () => { // khi click vào nút đăng xuất
    signOut(auth) // Gọi đến hàm có sẵn của firebase để đăng xuất
      .then(() => { // Đợi sau khi đăng xuất thành công
        window.location.href = "login.html" ;
      })
      .catch((error) => {
        console.log(error)
      });
  })
}

// Kiểm tra trạng thái đă đăng nhập hay chưa 
const chat = document.querySelector(".chat") ; // Lấy ra giao diện chat
const buttonLogin = document.querySelector("[button-login]") // Lấy ra nút đăng nhập 
const buttonRegister = document.querySelector("[button-register]") // Lấy ra nút đăng kí

onAuthStateChanged(auth, (user) => { // Gọi đến hàm có sẵn của firebase để kiểm tra xem đã đăng nhập hay chưa
  if (user) { //Nếu đã đăng nhập
    const uid = user.uid; // Lấy ra
    
    buttonLogout.style.display = "inline-block" // Khi đăng nhập thì hiển thị nút đăng xuất 
    chat.style.display= "block" // Khi đăng nhập thì hiển thị giao diện chat
  } else {
    buttonLogin.style.display = "inline-block"  // Khi chưa đăng nhập thì hiển thị núi đăng nhập
    buttonRegister.style.display = "inline-block" // Khi chưa đăng nhập thì hiển thị núi đăng kí
    if(chat) { // nếu có form chat mà chưa đăng nhập
      chat.innerHTML = "" // set innerHTML form chat thành rỗng để ẩn hết đi
    }
  }
});


//Chat cơ bản (Gửi tin nhắn văn bản) 
const formChat = document.querySelector(".chat .inner-form") // Lấy ra formChat
if(formChat) { // Nếu có formChat   

  // Upload ảnh
  const upload = new FileUploadWithPreview.FileUploadWithPreview('upload-images', { // Sử dụng hàm thư viện để khởi tạo
    multiple : true , // có đc up nhiều ảnh k
    maxFileCount : 6 , // Số ảnh up đc tối đa
  }); 



  formChat.addEventListener("submit" , async (event) => { // Khi submit formChat
    event.preventDefault() // Ngăn hành vi mặc định - load lại trang

    const userId = auth.currentUser.uid ; // Lấy ra id của user
    const content = event.target.content.value ;  // Lấy ra nội dung trong ô input của formChat
    const files = upload.cachedFileArray // up ảnh lên - lấy ra file ảnh

    const url = 'https://api.cloudinary.com/v1_1/desg6peyr/image/upload'; // api để upload ảnh
    const formData = new FormData(); // tạo mới 1 form data để gửi lên sever

    const imagesCloud = [] // Tạo 1 mảng để chứa ảnh up lên cloud

    for (let i = 0; i < files.length; i++) { // lặp qua từng file ảnh
      let file = files[i]; // lấy ra từng ảnh
      formData.append('file', file); // append file ảnh vào form
      formData.append('upload_preset', 'wrkf5xb3'); // chèn key từ cloudinary

      const response = await fetch(url, { // gọi đến api để thêm bản ghi
        method: 'POST',
        body: formData, // data gửi lên
      })
      const data = await response.json()
      imagesCloud.push(data.url)
    }


    if(userId && content || imagesCloud.length > 0 ) { // nếu có id user và nội dung hoặc ảnh
      set(push(ref(db , "chats")) , { // thêm tin nhắn vào databasse - hàm put có thể tự sinh ra id
        content : content ,
        userId : userId ,
        images : imagesCloud
      })
      event.target.content.value = "" // Reset lại ô input sau khi gửi nội dung
      upload.resetPreviewPanel(); // Reset lại sau khi gửi ảnh
    }
  })
}

// Xử lý hàm xóa tin nhắn
const buttonDeleteChat = (key) => {
  const buttonDelete = document.querySelector(`[button-delete = "${key}"]`) // lấy ra nút theo key của tin nhắn truyền vào
  buttonDelete.addEventListener("click" , () => { // khi click vào button có key đó
    remove(ref(db,`chats/${key}`)) // tham chiếu đến bảng chats => tin nhắn có key đó , sử dụng hàm remove của firebase để xóa
  })
}

// Sau khi xóa thì render lại giao diện
const bodyChat = document.querySelector(".chat .inner-body") // Lấy ra inner-body của chat để thêm tin nhắn
onChildRemoved(chatRef , (data) => { // Gọi vào hàm có sẵn của firebase để kiểm tra xem có children nào bị xóa không
  const key = data.key // lấy ra key tin nhắn bị xóa
  const elementDelete = document.querySelector(`[chat-key = "${key}"]`) // lấy ra elementChat có key = key đó
  bodyChat.removeChild(elementDelete) ; // xóa elementDelete trên giao diện
}) ;


// Lấy ra danh sách tin nhắn 
// const bodyChat = document.querySelector(".chat .inner-body") // Lấy ra inner-body của chat để thêm tin nhắn
if(bodyChat) {
  const chatsRef = ref(db, 'chats/'); // tham chiếu đến bảng chats trong database 
  onChildAdded(chatsRef ,  (dataChat) => { // Gọi đến hàm có sẵn của firebase để xử lý lặp qua từng phần tử của tin nhắn
    const key = dataChat.key ; // Lấy ra key của tin nhắn
    const userId = dataChat.val().userId // Lấy ra userId đã gửi tin nhắn
    const content = dataChat.val().content // Lấy ra nội dung tin nhắn
    const images =  dataChat.val().images // Lấy ra mảng phần ảnh



    get(child(dbRef, `users/${userId}`)).then((snapshot) => { // Gọi vào hàm có sẵn của database để truy cập vào bảng users lấy ra user gửi tin nhắn theo id
      if (snapshot.exists()) { // Nếu có data thì xử lý data
        const fullName = snapshot.val().fullName ; // Lấy ra họ tên user gửi tin nhắn

        const elementChat = document.createElement("div") ; // Tạo ra element div để chứa tin nhắn
        elementChat.setAttribute("chat-key" , key ) // thêm thuộc tính chatkey = key của tin nhắn

        let stringFullName = "" ; // Chuỗi dùng để hiển thị tên lên giao diện / vì nếu UserID hiện tại đã đăng nhập gửi thì sẽ không hiện tên
        let stringButtonDelete = "" // Dùng để hiển thị nút xóa lên nếu UserID đã đăng nhập hiện tại == UserId của tin nhắ
        let stringimages = "" // Dùng để hiển thị ảnh nếu có mảng images
        let stringcontent = ""


        if (content) {
          stringcontent += `
           <div class="inner-content">
              ${content}
            </div>
          `
        }

        if (images) {
          stringimages += `
            <div class="inner-images">
          `
 
          for (const image of images) { // Hàm for of dùng cho mảng
            stringimages += `
              <img src = '${image}'> 
            `
          }
          
          stringimages += `
            </div>
          `
        }

        if(userId == auth.currentUser.uid) { // Nếu UserID đã gửi tin nhắn có == UserID hiện tại đã đăng nhập không
          elementChat.classList.add("inner-outgoing")
          // Có tác dụng thêm nút xóa với 1 thuộc tính button-delete theo key tin nhắn
          stringButtonDelete = `
            <button class ="button-delete " button-delete = "${key}" >
              <i class="fa-regular fa-trash-can"></i>
            </button>
          `
        } else { // Nếu không phải
          elementChat.classList.add("inner-incoming") 
          // có tác dụng hiện thêm tên người gửi
          stringFullName = ` 
            <div class="inner-name">
              ${fullName} 
            </div>
          `
        }
        
        // thêm name và content vào element chat
        elementChat.innerHTML = ` 
          ${stringFullName} 
          ${stringcontent}
          ${stringimages}
          ${stringButtonDelete} 
        `

    
        bodyChat.appendChild(elementChat) ;

        new Viewer(elementChat) // Dùng thư viện ViewerJS để phóng to ảnh

        
        // gọi hàm để xử lý xóa tin nhắn
        if(userId == auth.currentUser.uid) { // Nếu UserID đã gửi tin nhắn có == UserID hiện tại đã đăng nhập không 
          buttonDeleteChat(key) // chạy vào hàm xóa
        }
        

      } else { // Nếu không lấy được data 
        console.log("No data available");
      }

    }).catch((error) => {
      console.error(error);
    });
  }) ; 
}

// Chèn icon 
const emojiPicker =  document.querySelector('emoji-picker') // lấy ra element emoji
if(emojiPicker) { // Nếu có element emoji 
  const inputChat = document.querySelector(".chat .inner-form input[name = 'content']") // Lấy ra ô input 

  emojiPicker.addEventListener('emoji-click', event => { // Gọi vào hàm có sẵn của emoji lấy ra sự kiện click vào icon
    const icon = event.detail.unicode // Lấy ra icon đc chọn   
    inputChat.value += icon // nội dung input sẽ += icon
  }); 
  
}

// Hiển thị tooltip  
const buttonIcon = document.querySelector(".button-icon") // Lấy ra element button-icon
if(buttonIcon) { // Nếu có buttonIcon
  const tooltip = document.querySelector('.tooltip') // Lấy ra element tooltip
  Popper.createPopper(buttonIcon, tooltip) // Khởi tạo popup bằng hàm có sẵn của thư viện
 
  buttonIcon.addEventListener("click" ,() => { // Khi click vào nút đó
    tooltip.classList.toggle('shown')
  })
}
























































































































































