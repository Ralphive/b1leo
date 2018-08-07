import os
from os import walk, getcwd

'''
this script automatically divides dataset into training and evaluation (10% for evaluation)
the JPEG image files and yolo output txt must be in the same folder.

default expected directories tree:
dataset- 
   -*.JPEG
   -*.txt
create_train_list.py   


to run this script:
$ python create_train_list.py  

'''
target_dataset_path = 'dataset' #relative path from create_train_list.py to dataset

def main():
    i=1 
    tst=0   #to count number of images for evaluation 
    trn=0   #to count number of images for training
    wd = getcwd()
    train_list_file = open('{}/train_list.txt'.format(wd), 'w')
    test_list_file  = open('{}/test_list.txt'.format(wd), 'w')
    for filename in os.listdir(target_dataset_path):
        if filename.endswith(".JPEG") or filename.endswith(".jpeg"): 
            # print(os.path.join(directory, filename))
            
            if (i%10)==0:  #each 10th file (xml and image) write it for evaluation
                test_list_file.write('{}\n'.format(os.path.join(wd, target_dataset_path, filename)))
                tst=tst+1
            else:          #the rest for training
                train_list_file.write('{}\n'.format(os.path.join(wd, target_dataset_path, filename)))
                trn=trn+1
            i=i+1
            continue

    test_list_file.close()
    train_list_file.close()
    print('Successfully create the train list and test list.')
    print('training dataset: # ')
    print(trn)
    print('test dataset: # ')
    print(tst)	
	
if __name__ == '__main__':
    main()