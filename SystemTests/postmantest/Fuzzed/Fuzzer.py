import random
import string
import csv
#import emojis

random_str = ''.join([random.choice(string.ascii_letters + string.digits + string.punctuation ) for n in range(12)])

client = "Sean Michael Lim"
department = "Graduate Office"
communication = "Video"
email = "seanmichael_lim@mymail.com"
problem = "Hello I have a big problem with my admission"
queueDropped = "false"

getReqCSA = {"client": "Sean Michael Lim",
    "department": "Graduate Office",
    "communication": "Chat",
    "email" : "tinkitwong@gmail.com", 
    "problem": "rh3ygbr",
    "queueDropped" : True
}

checkQueStatus = {
    "department": "Graduate Office",
    "communication": "Chat",
    "queueNumber": "3"
}

endChatInstance = { 
"clientEmail" : "tinkit@ioa.com",
"department":"Graduate Office",
"communication":"Chat",
"queueNumber":"4",
"jid" : "77d67a7492964a719a82718c76ba49a4@sandbox-all-in-one-rbx-prod-1.rainbow.sbg",
"convoID" : "someconvoID",
"queueDropped" : False,
"convoHistory" : {
  "0":{"user":"I got a big big problem"},
  "1":{"user":"I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem"},
  "2":{"user":"I got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problem"},
  "3":{"agent":"I got a big big solution"},
  "4":{"agent":"I got a big big solution"},
    }
}

superAdmin_createNew = {
    "email": "newkid@swaggy.com",
    "password": "idonlikeobeyingrules",
    "firstName": "New",
    "lastName": "Kid"
}

superAdmin_terminateNew = {
    "email": "nonexistent@swaggy.com",
    "password": "@NonExistent47",
    "firstName": "Non",
    "lastName": "Existent"
}

postReq_route = [getReqCSA,checkQueStatus,endChatInstance,superAdmin_createNew,superAdmin_terminateNew];
postReq_names = ["getReqCSA","checkQueStatus","endChatInstance","superAdmin_createNew","superAdmin_terminateNew"];


def swap(line, index1, index2):
    lst = list(line)
    lst[index1], lst[index2] = lst[index2], lst[index2]
    return ''.join(lst)
def swapBit(line, index1):
    lst = list(line)
    if(lst[index1] == "1"):
        lst[index1] = "0";
    else:
        lst[index1] = "1";
    return ''.join(lst)

def mutate(line):
    mutOps = [str(swapMut(line)), str(bitFlipMut(line)), str(trimMut(line))]
    return mutOps


def main(postReq,filename):
    final_dict_arr = []
    #print(mutOps[index]);
    for j in range(50):
        final_dict = {}
        for i in postReq:
            index = random.randint(0,2)
            if (isinstance(postReq[i] , str)):
                mutated = mutate(postReq[i]);
                final_dict.update({i:mutated[index]});
                #print(mutated);
            elif (isinstance(postReq[i] , dict)):
                chat = mutate_chat(postReq[i],index)
                final_dict.update({i:chat})
            else:
                final_dict.update({i:bool(random.getrandbits(1))});
        final_dict_arr.append(final_dict);
    write_csv(filename,postReq,final_dict_arr);

def mutate_chat(chat_dict,index):
    new_chat_dict ={};
    for i in chat_dict:
        if "user" in chat_dict[i]:
            line = (chat_dict[i]["user"])
            new_message = mutate(line)
            new_chat_dict.update({i:{"user":new_message[index]}})          
        elif "agent" in chat_dict[i]:
            line = chat_dict[i]["agent"]
            new_message = mutate(line)
            new_chat_dict.update({i:{"agent":new_message[index]}})
    print(new_chat_dict)
    return new_chat_dict;
        

def open_file(file_name):
    f_create = open("fuzzOutput.txt","x")
    f_create.close()
    f_a = open("fuzzOutput.txt","a")
    f_r = open(file_name,"r")
    for x in f_r:
        index = random.randint(0,2)
        mutOps = mutate(x)
        new_line = mutOps[index]
        f_a.write(new_line + "\n")
    f_a.close();
    f_r.close();

def write_csv(filename, postReq,final_dict_arr):
    file_name = "{}.csv".format(filename);
    with open(file_name, mode="w") as csv_file:
        fieldnames = postReq.keys();
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader();
        for i in final_dict_arr:
            writer.writerow(i);

def swapMut(line):
    if(len(line) == 0):
        return line
    else:
        num1 = random.randint(0,len(line)-1);
        num2 = random.randint(0,len(line)-1);
        new_line = swap(line, num1, num2);
        # buff1 = line[num1]
        # buff2 = line[num2]
        # line[num1] = buff2
        # line[num2] = buff1    
        return new_line;

def BinaryToDecimal(binary):       
    binary1 = binary  
    decimal, i, n = 0, 0, 0
    while(binary != 0):  
        dec = binary % 10
        decimal = decimal + dec * pow(2, i)  
        binary = binary//10
        i += 1
    return (decimal)   

def bitFlipMut(line):
    if(len(line) == 0):
        return line
    else:
        res = ''.join(format(ord(i), 'b') for i in line)
        # print(res);
        index = random.randint(0,len(res)-1)
        new_res = swapBit(res,index);
        str_data =' '
        for i in range(0, len(new_res), 7): 
            temp_data = int(new_res[i:i + 7])
            decimal_data = BinaryToDecimal(temp_data)
            str_data = str_data + chr(decimal_data)
        # print(str_data);
        return str_data;

def trimMut(line):
    if(len(line) == 0):
        return line
    else:
        num1 = random.randint(0,len(line)-1); 
        lst = list(line);
        lst_new = lst[:num1];
        return  ''.join(lst_new);

if __name__ == "__main__":
    for i in range(len(postReq_names)):
        main(postReq_route[i],postReq_names[i])
    